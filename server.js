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
	var directory = '.';

	FileSystem.exploreDir( directory ).then( function (dirContent) {
		res.render('index', {
			current: directory,
			contents: dirContent
		});
	});
});

app.get('/file', function (req, res) {
	var fRStream = FileSystem.frstream( req.query.id );

	fRStream.then( function(stream) {
		stream.pipe(res); 
	});
});

app.get('/directory', function (req, res) {
	var directory = req.query.id;

	FileSystem.exploreDir( directory ).then( function (dirContent) {
		res.render('index', {
			current: directory,
			contents: dirContent
		});
	});
});

var server = app.listen( 3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Fileserver listining at http://%s:%s...', host, port);
});

}());
