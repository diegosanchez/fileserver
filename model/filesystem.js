var Q = require('q');
var fs = require('fs');

function FileSystem (root) {
	this.root = root;
}

FileSystem.prototype.fstat = function(fullPathFile) {
	return  Q.denodeify(fs.stat)(fullPathFile);
};

FileSystem.prototype.freaddir = function(fullPath) {
	return Q.denodeify(fs.readdir)(fullPath)
};


module.exports = new FileSystem();