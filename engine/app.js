'use strict';

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
const configJson = require('./config.json');

http.globalAgent.maxSockets = 1000000000;
app.use(cors());
app.use(bodyParser.json({
  limit: '100mb'
}));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
}));

unsafe.use(bodyParser.json());

// console.log(configJson);
const connection = amqpManager.connect([(configJson.socketServerEngine ? configJson.socketServerEngine : configJson.socketServer) + '/' + configJson.amqpHost]);
const communication = require('./communication');
const onConnect = (channel) => {
  communication.setAmqpChannel(channel);
};
const channelWrapper = connection.createChannel({
  json: true,
  setup: function (channel) {
    console.log('AMQP Connection');

    onConnect(channel);
    return Promise.all([
      channel.assertQueue('work-ask', { durable: true }),
    ]);

  }
});

communication.setAmqpClient(channelWrapper);

app.use('/engine', unsafe);
communication.init(unsafe);
const port = process.env.APP_PORT || 8080;
app.listen(port, (err) => {
  console.log('listen at port ', port);
});
app.use((_err, req, res, next) => {
  if (_err) {
    errorHandling(_err, res, next);
  }
});
