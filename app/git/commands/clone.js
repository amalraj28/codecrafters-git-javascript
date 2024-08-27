const path = require("path");
const fs = require("fs");
const https = require("https");
const zlib = require("zlib");
const { createGitDirectory } = require("../utils");

class CloneCommand {
	constructor(url, dir) {
		this.url = url;
		this.dir = dir;
		this.gitFolderPath = path.join(process.cwd(), dir);
	}

	async #getRefObject(ref, sha, url) {
		const body = Buffer.from(`0032want ${sha}\n00000009done\n`, "utf8");
		console.log({ url });
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/x-git-upload-pack-request",
			},
			responseType: "arraybuffer",
		};

		return new Promise((resolve, reject) => {
			const req = https.request(`${url}/git-upload-pack`, options, (res) => {
				let responseBuffer = Buffer.alloc(0);

				res.on("data", (chunk) => {
					responseBuffer = Buffer.concat([responseBuffer, chunk]);
				});

				res.on("end", () => {
					console.log(responseBuffer.length);
					resolve(responseBuffer);
				});
			});

			req.on("error", (e) => {
				reject(`Some error occured: ${e.message}`);
			});
			req.write(body);
			req.end();
		});
	}

	async #fetchRefs(repoUrl) {
		return new Promise((resolve, reject) => {
			https.get(`${repoUrl}/info/refs?service=git-upload-pack`, (res) => {
				let responseBuffer = Buffer.alloc(0);
				res.on("data", (chunk) => {
					responseBuffer = Buffer.concat([responseBuffer, Buffer.from(chunk)]);
				});

				res.on("end", () => {
					const response = responseBuffer.toString();
					const size = response.length;

					if (size <= 3) {
						fs.rmSync(this.gitFolderPath, { recursive: true, force: true });
						process.stdout.write("remote: Repository not found\n");
						reject(new Error(`repository '${repoUrl}' not found`));
					}

					resolve(response);
				});
			});
		});
	}

	async execute() {
		const url = this.url;
		const dir = this.dir;
		const gitFolderPath = this.gitFolderPath;

		createGitDirectory(gitFolderPath, { writeToHead: false });

		const responseString = await this.#fetchRefs(url);
		const responses = responseString.split("\n");

		let [compatibleSHA, ...data] = responses[1].split(" ");
		if (compatibleSHA.substring(0, 4) === "0000") {
			compatibleSHA = compatibleSHA.slice(4);
		}

		const parsedData = responses.slice(2, responses.length - 1).map((item) => {
			const [refHash, ref] = item.split(" ");

			const sha = refHash.slice(4);
			return { sha, ref };
		});

		const main = parsedData.filter(
			(item) =>
				item.ref.includes("refs/heads/main") ||
				item.ref.includes("refs/heads/master")
		)[0];

		const mainSha = main.sha;
		const mainRef = main.ref;

		console.log({ mainRef, mainSha });

		const buffer = await this.#getRefObject(mainRef, mainSha, url);
		console.log(buffer);
	}
}

module.exports = CloneCommand;
