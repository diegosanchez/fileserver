var util = require('util');
var http = require('http');
var Router = require('./router');

function FileServer() {
};

FileServer.prototype.init = function(options) {
    var opts = options || {};

    this.port = opts.port || 3000;
    this.dir = opts.watch || process.env.PWD;

    this.router = new Router();

    this.router.get('/', function (response) {
    	response.write('<html></html>');
    })

    return this;
}

FileServer.prototype.start = function() {
	console.log("Starting file server on:", this.port);
	console.log("Watching:", this.dir);

	var self = this;
	this.http = http.createServer( function (req, res) {
		self.router.process( req, res);
	});
	this.http.listen( this.port );

}

module.exports = new FileServer();
