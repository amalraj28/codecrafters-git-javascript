const CatFileCommand = require("./cat-file");
const HashObjectCommand = require("./hash-object");
const LsTreeCommand = require("./ls-tree");
const WriteTreeCommand = require("./write-tree");
const CommitTreeCommand = require("./commit-tree");

module.exports = {
	CatFileCommand,
	HashObjectCommand,
	LsTreeCommand,
	WriteTreeCommand,
	CommitTreeCommand,
};
