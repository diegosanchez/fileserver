var util = require('util');
var fs = require('fs');
var http = require('http');
var url = require('url');

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
	console.log("Starting file server on:", this.port);
	console.log("Watching:", this.dir);

    var routes = [
        [ /\/files\/\w+/, function (req, res) {
            res.end('file: ' + req.url);
        }],
        [ /\//, function (req, res) {
            fs.readdir(self.dir, function(err, files) {
                res.write( "<html>\n");

                files.forEach( function(f) {
                    res.write(
                        util.format(
                            "<div><a href=\"/files/%s\">%s</a></div>\n", f, f
                        ) 
                    );
                });

                res.end("</html>");
            });
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
