"use strict";

var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1000000000;
const requestHandler = (request, response) => {
  response.end('Hello Node.js Server!')
}
var server = http.Server(requestHandler);
var env = process.env;
var url = require('url');
var fs = require('fs');
const configUrl = env.CONFIG_URL|| 'https://data-players.github.io/StrongBox/public/dev-docker.json'
const parsedUrl = url.parse(configUrl);
const requestOptions = {
  hostname: parsedUrl.hostname,
  path: parsedUrl.path,
  port: parsedUrl.port,
  headers: {
    Accept: 'text/plain, application/xml , application/ld+json',
    'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:44.0) Gecko/20100101 Firefox/44.0',
  }
};
https.get(requestOptions, function(res) {
  var responseBody = '';
  if (res.statusCode == 200) {

  }
  res.on('data', chunk => {
    responseBody += chunk.toString();
  });

  res.on('end', () => {
    console.log("http end", responseBody)
    let content = 'module.exports = ' + responseBody;
    fs.writeFile("configuration.js", content, 'utf8', function(err) {
      server.listen(JSON.parse(responseBody).timer.port || 8080, function () {
        console.log('~~ server started at ', this.address().address, ':', this.address().port)
        require('../core/timerScheduler').run(true);
      })
    });
  });

}.bind(this)).on('error', (e) => {
  console.error('timer APP config error', e);
  throw new Error(e)
});
