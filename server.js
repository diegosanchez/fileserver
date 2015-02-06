(function () {
"use strict";

var express = require('express');
var exphbs = require('express-handlebars');
var helpers = require('./helpers/all');
var FileSystem = require('./model/filesystem');

var app = express();
var templateEngine = exphbs({
	extname: '.hbs', 
	defaultLayout: 'main',
	helpers: helpers
});


app.engine('hbs', templateEngine );
app.set('view engine', 'hbs');
app.use( '/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	var directory = fileSystem.root;

	fileSystem.exploreDir( directory ).then( function (dirContent) {
		res.render('index', {
			current: directory,
			contents: dirContent
		});
	});
});

app.get('/file', function (req, res) {
	var fRStream = fileSystem.frstream( req.query.id );

	fRStream.then( function(stream) {
		stream.pipe(res); 
	});
});

app.get('/directory', function (req, res) {
	var directory = req.query.id;

	fileSystem.exploreDir( directory ).then( function (dirContent) {
		res.render('index', {
			current: directory,
			contents: dirContent
		});
	});
});

var args = require('argsparser').parse();

/****
* Arguments:
* 	+ -p: Listening port
*   + -d: Directory to watch
*/
var port = args['-p'] || 3000;
var fileSystem = new FileSystem(args['-d'] || '.');

var server = app.listen( port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Fileserver listining at http://%s:%s...', host, port);
	console.log('Watching:', fileSystem.root);
});

}());
