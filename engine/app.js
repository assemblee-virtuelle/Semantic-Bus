'use strict'

const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const amqp = require('amqplib/callback_api')
const safe = express.Router()
const bodyParser = require('body-parser')
const errorHandling = require('../core/helpers/errorHandling')
const configJson = require('./configuration')

http.globalAgent.maxSockets = 1000000000
app.use(cors())
app.use(bodyParser.json({
  limit: '10mb'
}))
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}))

safe.use(bodyParser.json())

amqp.connect((configJson.socketServerEngine? configJson.socketServerEngine : configJson.socketServer) + '/' + configJson.amqpHost, (err, conn) =>{
  conn.createChannel((_err, ch) => {
    ch.assertQueue('work-ask', {
      durable: true
    })
    onConnect(ch)
  })
})
const onConnect = (amqpClient) => {
  console.log("connexted to amqp")
  require('./amqpService')(safe, amqpClient)
}
app.use('/engine', safe)
let port=process.env.APP_PORT || 8080;
app.listen(port, function (err) {
  console.log("listen at port ",port)
})
app.use((_err, req, res, next) => {
  if (_err) {
    errorHandling(_err, res, next)
  }
})
