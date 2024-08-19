const path = require("path");
const zlib = require("zlib");
const fs = require("fs");

class CatFileCommand {
	constructor(flag, hash) {
		this.flag = flag;
		this.hash = hash;
	}

	execute() {
		const flag = this.flag;
		const hash = this.hash;

		switch (flag) {
			case "-p":
				{
					const folder = hash.slice(0, 2);
					const file = hash.slice(2);

					const fullPath = path.join(
						process.cwd(),
						".git",
						"objects",
						folder,
						file
					);

					if (!fs.existsSync(fullPath))
						throw new Error(`Not a valid object name ${hash}`);

					const fileContents = fs.readFileSync(fullPath);
					const outputBuffer = zlib.inflateSync(fileContents);
					const output = outputBuffer.toString().split('\x00')[1];

					process.stdout.write(output);
				}
				break;
		}
	}
}

module.exports = CatFileCommand;
