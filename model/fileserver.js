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


FileServer.prototype.start = function() {
    var self = this;
	console.log("Starting file server on:", this.port);
	console.log("Watching:", this.dir);

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

                  stream.on('end', function () {
                    deferred.resolve();
                  });

                  stream.on('error', function (error) {
                    deferred.reject(error); 
                  });

                  res.setHeader( 'content-type', mime.lookup(req.url) );
                  stream.pipe( res);

                  return deferred.promise;
                }
              )
              .catch( function (error) {
                res.writeHead( 404);
                res.end();
              })
              .done();
        }],
        [ /\//, function (req, res) {
          var fReadDir = Q.denodeify(fs.readdir); 
          fReadDir(self.dir)
          .then( function (files) {
            return Q.allSettled( files.map( function ( file ) {
              var deferred = Q.defer();
              fs.stat( file, function (err, stat) {
                  if ( err )
                      deferred.reject(err);
                  else
                      deferred.resolve( { stat: stat, file: file} );
              });

              return deferred.promise;
            }))
          })
          .then( function (results ) {
            res.write( "<html>\n");

            results.forEach( function (r, i, array) {
                var format = "<div><a href=\"/file/%s\">%s</a></div>\n";

                if ( r.value.stat.isDirectory() ) {
                    format = "<div><a href=\"/directory/%s\">%s</a></div>\n";
                }

                res.write( util.format(format, r.value.file, r.value.file) );

                if ( i === array.length - 1 )
                    res.end("</html>");
            })
          })
          .done();
        }]
    ];
    
	var self = this;
	this.http = http.createServer( function (req, res) {
        for( var i in routes) {
            if ( routes[i][0].test( req.url ) ) {
                routes[i][1]( req, res);
                return;
            }
        }

        routes[-1][1]( req, res);
	});

	this.http.listen( this.port );

}

module.exports = new FileServer();
