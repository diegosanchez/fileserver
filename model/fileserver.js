var util = require('util');
var fs = require('fs');
var http = require('http');
var url = require('url');
var mime = require('mime');
var path = require('path');
var Q = require('q');
var FileSystem = require('./filesystem');

function FileServer() {
    this.port = 3000;
    this.dir = process.cwd();
    this.routes = [];
};

FileServer.prototype.init = function(options) {
    var opts = options || {};

    this.port = opts.port || 3000;
    this.dir = process.cwd();

    return this;
}

FileServer.prototype.file2html = function (fileStatus) {
  var format = "<div><a href=\"/file/%s\">%s</a></div>\n";

  if ( fileStatus.status.isDirectory() ) {
      format = "<div><a href=\"/directory/%s\">%s</a></div>\n";
  }

  return util.format(format, fileStatus.file, fileStatus.file);
}

FileServer.prototype.requestToLocalFile = function(url) {
  return path.join( this.dir, url.split("/").slice(2).join("/"));
};

FileServer.prototype.record = function(pattern, callback) {
  this.routes.push( {pattern: pattern, cb: callback });
};

FileServer.prototype.rootHandler = function(req, res) {
  var self = this;
  console.log("HP", self);

  var fReadDir = FileSystem.freaddir(self.dir);

  fReadDir
  .then( function (files) {
    // Create stat promises for each file
    var statPromises = files.map( function (f) {
      return FileSystem.fstat(f);
    });

    Q.allSettled( statPromises).then( function (results) {
      res.write("<html>\n");
      results.forEach( function (entry, index, array) {
        res.write( self.file2html(entry.value) );
        if ( index === array.length - 1 ) {
          res.write("</html>\n");
          res.end();
        };
      })
    })
  })
  .catch( function (error) {
    res.writeHead( 500);
    res.end();
  })
  .done();


}

FileServer.prototype.handlerFile = function(req, res) {
}

FileServer.prototype.handlerDirectory = function(req, res) {
  res.end( "Directory: " + req.url );
}

FileServer.prototype.loadRoutes = function() {
  var self = this;

  this.record( /\/directory\/.+/, this.handlerDirectory);

  this.record( /\/file\/.+/, this.handlerFile);

  this.record( /\//, this.rootHandler );
}

FileServer.prototype.start = function() {
  var self = this;
	console.log("Starting file server on:", this.port);
	console.log("Watching:", this.dir);
    
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

}

module.exports = new FileServer();
