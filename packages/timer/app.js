"use strict";
const configJson = require('./config.json')
var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1000000000;
const requestHandler = (request, response) => {
  response.end('Hello Node.js Server!')
}
var server = http.Server(requestHandler);
var env = process.env;
const amqpManager = require('amqp-connection-manager');
var url = require('url');
var fs = require('fs');
const configUrl = env.CONFIG_URL
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


const content = 'module.exports = ' + JSON.stringify(configJson)
// fs.writeFile('configuration.js', content, 'utf8', function(err) {
server.listen(env.PORT, function () {
  console.log('~~ server started ')

})

console.log('🔗 AMQP:', configJson.socketServer + '/' + configJson.amqpHost)
let connection = amqpManager.connect([configJson.socketServer + '/' + configJson.amqpHost])
var channelWrapper = connection.createChannel({
  json: true,
  setup: (channel)=>{
    // console.log('allo')
    // channel.assertExchange('amq.topic','topic', {
    //   durable: true
    // })
    // channel.assertQueue('process-persist', { exclusive: true, durable: true }).then((q)=>{
    //   channel.bindQueue(q.queue, 'amq.topic', "process-persist.*");
    // })

    // channel.assertQueue('process-start', { exclusive: true, durable: true }).then((q)=>{
    //   channel.bindQueue(q.queue, 'amq.topic', "process-start.*");
    // })
    onConnect(channel);
  } 
  
});
const onConnect = (channel) => {
  console.log('✅ AMQP connected');
  require('@semantic-bus/core/timerScheduler').run(channel);
}

// })

// https.get(requestOptions, function(res) {
//   var responseBody = '';
//   if (res.statusCode == 200) {

//   }
//   res.on('data', chunk => {
//     responseBody += chunk.toString();
//   });

//   res.on('end', () => {
//     // console.log("http end", responseBody)
//     let content = 'module.exports = ' + responseBody;
//     fs.writeFile("configuration.js", content, 'utf8', function(err) {
//       server.listen(8080, function () {
//         console.log('~~ server started ')
//         require('@semantic-bus/core/timerScheduler').run(true);
//       })
//     });
//   });

// }.bind(this)).on('error', (e) => {
//   console.error('timer APP config error', e);
//   throw new Error(e)
// });
