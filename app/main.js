const fs = require("fs");
const path = require("path");
const GitClient = require("./git/client");
const { createGitDirectory } = require("./git/utils");

const gitClient = new GitClient();

//Commands
const {
	CatFileCommand,
	HashObjectCommand,
	LsTreeCommand,
	WriteTreeCommand,
	CommitTreeCommand,
	CloneCommand,
} = require("./git/commands");

// Uncomment this block to pass the first stage
const command = process.argv[2];

switch (command) {
	case "init":
		handleInitCommand();
		break;
	case "cat-file":
		handleCatFileCommand();
		break;
	case "hash-object":
		handleHashObjectCommand();
		break;
	case "ls-tree":
		handleLsTreeCommand();
		break;
	case "write-tree":
		handleWriteTreeCommand();
		break;
	case "commit-tree":
		handleCommitTreeCommand();
		break;
	case "clone":
		handleCloneCommand();
		break;
	default:
		throw new Error(`Unknown command ${command}`);
}

function handleInitCommand() {
	createGitDirectory(process.cwd());
	console.log("Initialized git directory");
}

function handleCatFileCommand() {
	const flag = process.argv[3];
	const commitHash = process.argv[4];
	const command = new CatFileCommand(flag, commitHash);

	gitClient.run(command);
}

function handleHashObjectCommand() {
	let flag = process.argv[3];
	let filePath = process.argv[4];

	if (!filePath) {
		filePath = flag;
		flag = null;
	}

	const command = new HashObjectCommand(flag, filePath);
	gitClient.run(command);
}

function handleLsTreeCommand() {
	let flag = process.argv[3];
	let hash = process.argv[4];

	if (!hash && flag === "--name-only") return;
	if (!hash) {
		hash = flag;
		flag = null;
	}

	const command = new LsTreeCommand(flag, hash);
	gitClient.run(command);
}

function handleWriteTreeCommand() {
	const command = new WriteTreeCommand();
	gitClient.run(command);
}

function handleCommitTreeCommand() {
	const treeSHA = process.argv[3];
	const commitSHA = process.argv[5];
	const msg = process.argv[7];
	if (!commitSHA) {
		throw new Error(`not a valid object name ${treeSHA}`);
	}
	if (!msg) {
		throw new Error(` switch 'm' requires a value`);
	}

	const command = new CommitTreeCommand(treeSHA, commitSHA, msg);
	gitClient.run(command);
}

function handleCloneCommand() {
	const url = process.argv[3];
	const dir = process.argv[4];

	const folderPath = path.join(process.cwd(), dir);

	if (fs.existsSync(folderPath)) {
		if (fs.readdirSync(folderPath).length !== 0)
			throw new Error(
				`destination path '${dir}' already exists and is not an empty directory.`
			);
	} else {
		fs.mkdirSync(folderPath);
	}

	const command = new CloneCommand(url, dir);
	gitClient.run(command);
}
