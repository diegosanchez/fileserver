var util = require('util');
var fs = require('fs');
var http = require('http');
var url = require('url');
var mime = require('mime');
var path = require('path');
var Q = require('q');

function FileServer() {
};

FileServer.prototype.init = function(options) {
    var opts = options || {};
    var self = this;

    self.port = opts.port || 3000;
    self.dir = process.cwd();

    return self
}

FileServer.prototype.fileStat = function(fullPath) {
  var deferred = Q.defer();

  fs.stat( fullPath, function (err, stat) {
    if (err)
      deferred.reject(err);

    deferred.resolve( { file: fullPath, status: stat});

  })
  return deferred.promise;
}

FileServer.prototype.file2html = function (fileStatus) {
  var format = "<div><a href=\"/file/%s\">%s</a></div>\n";

  if ( fileStatus.status.isDirectory() ) {
      format = "<div><a href=\"/directory/%s\">%s</a></div>\n";
  }

  return util.format(format, fileStatus.file, fileStatus.file);
}

FileServer.prototype.loadRoutes = function() {
var self = this;
var routes = [
    [ /\/directory\/.+/, function (req, res) {
        res.end( "Directory: " + req.url );

    }],
    [ /\/file\/.+/, function (req, res) {
        var localFilePath = path.join( self.dir, path.basename(req.url) );
        var fStat = Q.denodeify(fs.stat);

        fStat(localFilePath)
          .then( function ( /* stat */) {
              var deferred = Q.defer();
              var stream = fs.createReadStream(localFilePath);

              stream.on('end', function () {deferred.resolve(); });
              stream.on('error', function (error) {deferred.reject(error); });

              res.setHeader( 'content-type', mime.lookup(req.url) );
              stream.pipe( res);

              return deferred.promise;
          })
          .catch( function (error) {
            res.writeHead( 404);
            res.end();
          })
          .done();
    }],
    [ /\//, function (req, res) {
      var fReadDir = Q.denodeify(fs.readdir); 

      fReadDir(self.dir).then( function (files) {
        // Create stat promises for each file
        var statPromises = files.map( function (f) {
          return self.fileStat(f);
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
    }]
];

self.routes = routes;
}

FileServer.prototype.start = function() {
  var self = this;
	console.log("Starting file server on:", this.port);
	console.log("Watching:", this.dir);
    
  this.loadRoutes();

	this.http = http.createServer( function (req, res) {
    for( var i in self.routes) {
        if ( self.routes[i][0].test( req.url ) ) {
            self.routes[i][1]( req, res);
            return;
        }
    }

    self.routes[-1][1]( req, res);
	});

	this.http.listen( this.port );

}

module.exports = new FileServer();
