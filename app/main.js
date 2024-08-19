const GitClient = require("./git/client");
const gitClient = new GitClient();

//Commands
const { CatFileCommand } = require("./git/commands");

// Uncomment this block to pass the first stage
const command = process.argv[2];

switch (command) {
	case "init":
		createGitDirectory();
		break;
	case "cat-file":
		handleCatFileCommand();
		break;
	default:
		throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
	mkdirSync(join(process.cwd(), ".git"), { recursive: true });
	mkdirSync(join(process.cwd(), ".git", "objects"), { recursive: true });
	mkdirSync(join(process.cwd(), ".git", "refs"), { recursive: true });

	writeFileSync(join(process.cwd(), ".git", "HEAD"), "ref: refs/heads/main\n");
	console.log("Initialized git directory");
}

function handleCatFileCommand() {
	const flag = process.argv[3];
	const commitHash = process.argv[4];
	const command = new CatFileCommand(flag, commitHash);

	gitClient.run(command);
}
