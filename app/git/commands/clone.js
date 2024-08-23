const path = require("path");
const { createGitDirectory } = require("../utils");

class CloneCommand {
	constructor(url, dir) {
		this.url = url;
		this.dir = dir;
	}

	execute() {
		const url = this.url;
		const dir = this.dir;

		const folderPath = path.join(process.cwd(), dir);
		createGitDirectory(folderPath);
	}
}

module.exports = CloneCommand;
