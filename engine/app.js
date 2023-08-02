'use strict'

const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const amqp = require('amqplib/callback_api');
const amqpManager = require('amqp-connection-manager');
const unsafe = express.Router();
const bodyParser = require('body-parser');
const env = process.env;
const fs = require('fs');
const url = env.CONFIG_URL;
const errorHandling = require('../core/helpers/errorHandling');
const request = require('request');
const configJson = require('./config.json')

http.globalAgent.maxSockets = 1000000000
app.use(cors())
app.use(bodyParser.json({
  limit: '100mb'
}))
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
}))

unsafe.use(bodyParser.json())

const content = 'module.exports = ' + JSON.stringify(configJson)

fs.writeFile('configuration.js', content, 'utf8', function(err) {
  if (err) {
    throw err
  } else {
    console.log(configJson);
    let connection = amqpManager.connect([(configJson.socketServerEngine ? configJson.socketServerEngine : configJson.socketServer) + '/' + configJson.amqpHost]);
    let communication= require('./communication');
    var channelWrapper = connection.createChannel({
      json: true,
      setup: function(channel) {
        console.log("AMQP Connection");

        onConnect(channel);
        return Promise.all([
          channel.assertQueue('work-ask', { durable: true }),
        ]);
        // `channel` here is a regular amqplib `ConfirmChannel`.
        // Note that `this` here is the channelWrapper instance.
        // return channel.assertQueue('rxQueueName', {
        //   durable: true
        // });
      }
    });
    // amqp.connect((configJson.socketServerEngine ? configJson.socketServerEngine : configJson.socketServer) + '/' + configJson.amqpHost, (err, conn) => {
    //   conn.createChannel((_err, ch) => {
    //     ch.assertQueue('work-ask', {
    //       durable: true
    //     })
    //     onConnect(ch)
    //   })
    // })
    communication.setAmqpClient(channelWrapper)
    const onConnect = (amqpClient) => {
      // console.log('ALLO');
      communication.setAmqpChannel(amqpClient);
      // require('./amqpService')(unsafe, amqpClient)
    }
    app.use('/engine', unsafe)
    communication.init(unsafe);
    let port = process.env.APP_PORT || 8080;
    app.listen(port, function(err) {
      console.log("listen at port ", port)
    })
    app.use((_err, req, res, next) => {
      if (_err) {
        errorHandling(_err, res, next)
      }
    })
  }
})

// console.log('url',url);
// request(url, {
//   json: true
// }, (err, result, body) => {
//   const configJson = result.body
 
// })
