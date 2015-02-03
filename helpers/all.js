(function () {
"use strict";

var util = require('util');
var path = require('path');

exports.relativePath = function (file, current) {
	return path.relative(current, file); 
};

exports.resourcePath = function  (entry, currentDirectory) {
	var format = (entry.status.isDirectory() ) ? '/directory/%s' : '/file/%s';

	return util.format(format, path.relative(currentDirectory, entry.file) );
};

}());