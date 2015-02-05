(function () {
"use strict";

var util = require('util');
var path = require('path');

/****
* It returns class according to directory entry type (file or directory)
**/
exports.entryClass = function (entry) {
	return ((entry.status.isDirectory()) ? 'directory' : 'file') + '-entry';
};

/***
* It returns 'style_even' whether index is even or 'style_odd' whether
* index is odd
*/
exports.alternateClass = function (index, style) {
	return style + ( (index % 2) ? '_odd':'_even' );
};

/****
* Returns file relative to current directory. It avoids showing
* full path file
*/
exports.relativePath = function (file, current) {
	return path.relative(current, file); 
};

/***
* It composses resource depending on file type
**/
exports.resourcePath = function  (entry, currentDirectory) {
	var format = (entry.status.isDirectory() ) ? '/directory' : '/file';

	format += '?id=%s';

	console.log("format:", format, "entry:", entry.file, " currentDirectory:", currentDirectory);
	console.log("entry:", entry.file, " formated:", util.format(format, entry.file));

	return util.format(format, entry.file);
};

}());