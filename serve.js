var express = require('express');
var app = express();
var server = require('http').Server(app);
var config = require('config');
var path = require('path');
var deferred = new Promise(function (resolve, reject) {
  server.listen(config.get('frontPort'), function () {
    var port = server.address().port;
    console.log('Example app listening at http://localhost:%s', port);
    resolve(app);
  });

  app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
  app.use(express.static(path.join(__dirname, config.get('dir'))));
});

module.exports = deferred;
