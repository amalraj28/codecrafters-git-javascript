const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class HashObjectCommand {
	constructor(flag, filePath) {
		this.flag = flag;
		this.filePath = filePath;
	}

	execute() {
		const filePath = path.resolve(this.filePath);
		if (!fs.existsSync(filePath)) {
			throw new Error(
				`could not open '${this.filePath}' for reading: No such file or directory`
			);
		}

		const contents = fs.readFileSync(filePath);
		const size = contents.length;

		const header = `blob ${size}\0`;
		const blob = Buffer.concat([Buffer.from(header), contents]);

		const hash = crypto.createHash("sha1").update(blob).digest("hex");

		if (this.flag && this.flag === "-w") {
			const folder = hash.slice(0, 2);
			const file = hash.slice(2);

			const folderPath = path.join(process.cwd(), ".git", "objects", folder);

			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath);
			}

			const compressedData = zlib.deflateSync(blob);
			fs.writeFileSync(path.join(folderPath, file), compressedData);
		}

		process.stdout.write(hash);
	}
}

module.exports = HashObjectCommand;
