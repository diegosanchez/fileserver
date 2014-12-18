var Q = require('q');
var fs = require('fs');

function FileSystem (root) {
	this.root = root;
}

FileSystem.prototype.fstat = function(fullPathFile) {
	return  Q.denodeify(fs.stat)(fullPathFile);
};

module.exports = new FileSystem();