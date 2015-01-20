'use strict';

var Q = require('q');
var fs = require('fs');

function FileSystem (root) {
	this.root = root;
}

FileSystem.prototype.frstream = function(fullPathFile) {
  var deferred = Q.defer();

  var _success = function (args) {
  	if ( args.status.isDirectory() ) {
  		console.log('b 2');
  		deferred.reject(new Error('Not a file'));
  	}
  	else {
  		deferred.resolve( fs.createReadStream(fullPathFile) );
  	}
  };

  var _error = function (reason) {
	deferred.reject(new Error('Not a file'));
  };

  this.fstat(fullPathFile).then( _success, _error );

  return deferred.promise;
};

FileSystem.prototype.fstat = function(fullPath) {
	function _fstat () {
	  var deferred = Q.defer();

	  fs.stat( fullPath, function (err, stat) {
	    if (err)
	      deferred.reject(err);

	    deferred.resolve( { file: fullPath, status: stat});

	  });
	  return deferred.promise;
	}

	return  _fstat( fullPath);
};

FileSystem.prototype.freaddir = function(fullPath) {
	return Q.denodeify(fs.readdir)(fullPath);
};


module.exports = new FileSystem();