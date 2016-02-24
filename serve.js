var express = require('express');
var app = express();
var server = require('http').Server(app);
var config = require('config');
var path = require('path');
var deferred = new Promise(function (resolve) {
  server.listen(config.get('frontPort'), function () {
    var port = server.address().port;
    console.log('Example app listening at http://localhost:%s', port);
    resolve(app);
  });

  app.use(express.static(path.join(__dirname, 'build')));
});

module.exports = deferred;
