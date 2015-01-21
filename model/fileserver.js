'use strict';

var util = require('util');
var http = require('http');
var url = require('url');
var path = require('path');
var Q = require('q');
var FileSystem = require('./filesystem');

function FileServer() {
    this.init();
}

/***
* It sets up initial server configuration
**/
FileServer.prototype.init = function(options) {
    var opts = options || {};

    this.port = opts.port || 3000;
    this.dir = process.cwd();
    this.routes = [];

    return this;
};

/***
* It records a new root and its handler
*
* pattern: Regex which define route,
* callback: Request handler
*/
FileServer.prototype.record = function(pattern, callback) {
  this.routes.push( {pattern: pattern, cb: callback });
};

/***
* It loads resources published by the server
**/
FileServer.prototype.loadRoutes = function() {
  this.record( /\/directory\/.+/, this.handlerDirectory);
  this.record( /\/file\/.+/, this.handlerFile);
  this.record( /\//, this.rootHandler );
};

/***
* Handler for root resource
*/
FileServer.prototype.rootHandler = function(req, res) {
  this.deliversDir(this.dir, res);
};

/***
* Handler for directory resources
*/
FileServer.prototype.handlerDirectory = function(req, res) {
  this.deliversDir( this.requestToLocalFile(req.url), res );
};

/***
* Handler for file resources
*/
FileServer.prototype.handlerFile = function(req, res) {
  var fRStream = FileSystem.frstream( this.requestToLocalFile(req.url));

  var _error = function (reason) {
    res.writeHead(500);
    res.end();
  };

  fRStream.then(
    function(stream) {stream.pipe(res); },  // success
    _error                                  // error
  )
  .catch( _error  );
 
};

FileServer.prototype.deliversDir = function(dirPath, res) {
  var self = this;

  FileSystem.exploreDir(dirPath).then(
    function (contents) {
      res.write('<html>\n');
      contents.forEach( function (entry, index, array) {
        res.write( self.file2html(entry.value) );
        if ( index === array.length - 1 ) {
          res.write('</html>\n');
          res.end();
        }
      });
    },
    function (reason) {
      return new Error(reason);
    })
  .catch( function (reason)  { new Error('Not a dir'); })
  .done();

};

FileServer.prototype.file2html = function (fileStatus) {
  var format = '<div><a href=\"/file/%s\">%s</a></div>\n';
  var relativePath = path.relative(this.dir, fileStatus.file);

  if ( fileStatus.status.isDirectory() ) {
      format = '<div><a href=\"/directory/%s\">%s</a></div>\n';
  }

  return util.format(format, relativePath, relativePath);
};

FileServer.prototype.requestToLocalFile = function(url) {
  return path.join( url.split('/').slice(2).join('/'));
};

FileServer.prototype.start = function() {
  var self = this;
	console.log('Starting file server on:', this.port);
	console.log('Watching:', this.dir);
    
  this.loadRoutes();

	this.http = http.createServer( function (req, res) {
    for( var i in self.routes) {
        if ( self.routes[i].pattern.test( req.url ) ) {
            var callBack = self.routes[i].cb.bind(self);
            callBack( req, res);
            return;
        }
    }

    self.routes[-1].cb( req, res);
	});

	this.http.listen( this.port );

};

module.exports = new FileServer();
