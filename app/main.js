const fs = require("fs");
const path = require("path");
const GitClient = require("./git/client");

const gitClient = new GitClient();

//Commands
const { CatFileCommand, HashObjectCommand } = require("./git/commands");

// Uncomment this block to pass the first stage
const command = process.argv[2];

switch (command) {
	case "init":
		createGitDirectory();
		break;
	case "cat-file":
		handleCatFileCommand();
		break;
	case "hash-object":
		handleHashObjectCommand();
		break;
	default:
		throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
	fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
	fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), {
		recursive: true,
	});
	fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

	fs.writeFileSync(
		path.join(process.cwd(), ".git", "HEAD"),
		"ref: refs/heads/main\n"
	);
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

	command.execute();
}
