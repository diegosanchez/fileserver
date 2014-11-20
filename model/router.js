function Router() {
	this.routes = [];
}

Router.prototype.get = function( url, callback) {
	this.routes.push( { url: url, cb: callback } );
}

Router.prototype.process = function(request, response) {

	var handlers = this.routes.filter( function ( e ) {
		return e.url.match( request.url );	
	});

	if ( handlers.length === 0) {
		response.writeHead( 500);
	}
	else {
		handlers.forEach( function (route) {
			route.cb(response);
		})
	}

	response.end();
}

module.exports = Router;
