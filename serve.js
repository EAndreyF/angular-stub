var express = require('express');
var app = express();
var server = require('http').Server(app);
var config = require('config');
var path = require('path');

server.listen(config.get('frontPort'), function () {
    var port = server.address().port;
    console.log('Example app listening at http://localhost:%s', port);
});

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, '.tmp')));

module.exports = app;
