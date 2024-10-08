const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");
const path = require("path");

function createBlobHash(filePath) {
	const fileContents = fs.readFileSync(filePath);
	const size = fileContents.length;

	const header = `blob ${size}\0`;
	const blob = Buffer.concat([Buffer.from(header), fileContents]);

	const sha = crypto.createHash("sha1").update(blob).digest("hex");

	return { sha, blob };
}

function writeDataToFile(sha, data) {
	const basePath = path.join(process.cwd(), ".git", "objects");
	const folder = sha.slice(0, 2);
	const file = sha.slice(2);

	const folderPath = path.join(basePath, folder);

	if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
	const compressed = zlib.deflateSync(data);
	fs.writeFileSync(path.join(folderPath, file), compressed);
}

function createGitDirectory(folderPath, branch = "main") {
	fs.mkdirSync(path.join(folderPath, ".git"), { recursive: true });
	fs.mkdirSync(path.join(folderPath, ".git", "objects"), {
		recursive: true,
	});
	fs.mkdirSync(path.join(folderPath, ".git", "refs"), { recursive: true });

	fs.writeFileSync(
		path.join(folderPath, ".git", "HEAD"),
		`ref: refs/heads/${branch}\n`
	);
}

const email = "abcd@gmail.com";
const name = "abcd";
const date = Date.now();
const timeZone = "+0530";

module.exports = {
	createBlobHash,
	writeDataToFile,
	createGitDirectory,
	email,
	name,
	timeZone,
	date,
};
