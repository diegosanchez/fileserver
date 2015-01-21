'use strict';

var Q = require('q');
var fs = require('fs');
var path = require('path');

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
  var deferred = Q.defer();

  fs.readdir( fullPath, function (err, files) {
    if (err) {
      deferred.reject(err); 
    } else {
      deferred.resolve( 
        files.map( function (e) {           // Include parent directory info
          return path.join( fullPath, e); 
        })
      );
    }
  });

  return deferred.promise;
};

/***
* It returns a set of file's status per entry inside the directory
*/
FileSystem.prototype.exploreDir = function(fullPath) {
  var self = this;

  var fReadDir = self.freaddir(fullPath);

  return fReadDir.then( function (files) {
      // Create stat promises for each file
      var statPromises = files.map( function (f) {
        return self.fstat(f);
      });
      
      return Q.allSettled( statPromises);
    });
};


module.exports = new FileSystem();