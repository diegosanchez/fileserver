var http = require('http');
var util = require('util');
var fileServer = require('./model/fileserver');

var server = fileServer.init();

server.start();

