const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { createBlobHash, writeDataToFile } = require("../utils");

class WriteTreeCommand {
	constructor() {}

	execute() {
		function recursiveCreateTree(basePath) {
			const dirContents = fs.readdirSync(basePath);
			const results = [];

			dirContents.forEach((dirContent) => {
				if (dirContent.includes(".git")) return;
				const currentPath = path.join(basePath, dirContent);
				const stat = fs.statSync(currentPath);

				if (stat.isFile()) {
					const filePath = path.join(basePath, dirContent);
					const { sha, blob } = createBlobHash(filePath);
					writeDataToFile(sha, blob);

					results.push({
						mode: "100644",
						basename: path.basename(currentPath),
						sha,
					});
				} else if (stat.isDirectory()) {
					const sha = recursiveCreateTree(currentPath);
					if (sha) {
						results.push({
							mode: "040000",
							basename: path.basename(currentPath),
							sha,
						});
					}
				}
			});

			if (dirContents.length === 0 || results.length === 0) return null;
			const treeData = results.reduce((acc, current) => {
				const { mode, basename, sha } = current;
				return Buffer.concat([
					acc,
					Buffer.from(`${mode} ${basename}\0`),
					Buffer.from(sha, "hex"),
				]);
			}, Buffer.alloc(0));
			
      const tree = Buffer.concat([
				Buffer.from(`tree ${treeData.length}\0`),
				treeData,
			]);

      const hash = crypto.createHash("sha1").update(tree).digest("hex");
			writeDataToFile(hash, tree);
      return hash;
		}

    const sha = recursiveCreateTree(process.cwd());
    process.stdout.write(sha);
	}
}

module.exports = WriteTreeCommand;
