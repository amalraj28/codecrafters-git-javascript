const { name, email, date, timeZone, writeDataToFile } = require("../utils");
const crypto = require("crypto");

class CommitTreeCommand {
	constructor(treeSHA, parentSHA, msg) {
		this.treeSHA = treeSHA;
		this.parentSHA = parentSHA;
		this.msg = msg;
	}

	execute() {
		const treeSHA = this.treeSHA;
		const parentSHA = this.parentSHA;
		const msg = this.msg;
		const commitContentBuffer = Buffer.concat([
			Buffer.from(`tree ${treeSHA}\n`),
			Buffer.from(`parent ${parentSHA}\n`),
			Buffer.from(`author ${name} <${email}> <${date}> ${timeZone}\n`),
			Buffer.from(`committer ${name} <${email}> ${date} ${timeZone}\n\n`),
			Buffer.from(`${msg}\n`),
		]);

		const header = `commit ${commitContentBuffer.length}\0`;
		const commit = Buffer.concat([Buffer.from(header), commitContentBuffer]);

		const commitSHA = crypto.createHash("sha1").update(commit).digest("hex");
		writeDataToFile(commitSHA, commit);

    process.stdout.write(commitSHA);
	}
}

module.exports = CommitTreeCommand;
