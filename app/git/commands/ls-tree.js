const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

class LsTreeCommand {
	constructor(flag, hash) {
		this.flag = flag;
		this.hash = hash;
	}

	execute() {
		const flag = this.flag;
		const hash = this.hash;

		const folder = hash.slice(0, 2);
		const file = hash.slice(2);

		const folderPath = path.join(process.cwd(), ".git", "objects", folder);
		const filePath = path.join(folderPath, file);

		if (!fs.existsSync(filePath)) {
			throw new Error(`Not a valid object name ${hash}`);
		}

		const contents = fs.readFileSync(filePath);
		const outputBuffer = zlib.inflateSync(contents);
		const outputString = outputBuffer.toString("binary");

		let currIndex = outputString.indexOf("\0") + 1;
		const entries = [];

		while (currIndex < outputString.length) {
			const spaceIndex = outputString.indexOf(" ", currIndex);
			let mode = outputString.slice(currIndex, spaceIndex);
			currIndex = spaceIndex + 1;

			const nullCharIndex = outputString.indexOf("\0", currIndex);
			const fileName = outputString.slice(currIndex, nullCharIndex);
			currIndex = nullCharIndex + 1;

			const sha = outputString.slice(currIndex, currIndex + 20);
			currIndex += 20;
			const shaHex = Buffer.from(sha, "binary").toString("hex");
			let name = mode === "40000" ? "tree" : "blob";
			if (mode === "40000") mode = "040000";

			entries.push({ mode, fileName, shaHex, name });
		}

		entries.forEach((entry) => {
			if (flag !== "--name-only") {
				process.stdout.write(
					`${entry.mode} ${entry.name} ${entry.shaHex}\t${entry.fileName}\n`
				);
			} else {
				process.stdout.write(`${entry.fileName}\n`);
			}
		});
	}
}

module.exports = LsTreeCommand;
