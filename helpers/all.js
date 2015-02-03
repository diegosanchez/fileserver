(function () {
"use strict";

var util = require('util');
var path = require('path');

exports.relativePath = function (file, current) {
	return path.relative(current, file); 
};

exports.resourcePath = function  (entry, currentDirectory) {
	var format = (entry.status.isDirectory() ) ? '/directory' : '/file';

	format += '?id=%s';

	console.log("format:", format, "entry:", entry.file, " currentDirectory:", currentDirectory);
	console.log("entry:", entry.file, " formated:", util.format(format, entry.file));

	return util.format(format, entry.file);
};

}());