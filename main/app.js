/* eslint-disable handle-callback-err */
'use strict'
const configJson = require('./config.json')

const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
// const amqp = require('amqplib/callback_api');
const amqpManager = require('amqp-connection-manager')
const safe = express.Router()
const unSafeRouteur = express.Router()
const bodyParser = require('body-parser')
const request = require('request')
const env = process.env
const fs = require('fs')
const url = env.CONFIG_URL
const errorHandling = require('../core/helpers/errorHandling')
const cron = require('node-cron')
const workspace_lib = require('../core/lib/workspace_lib')
// const { createFragmentTable } = require('../core/db/dynamodb_admin');
const { createFileTable } = require('../core/db/scylla_admin')
const { migrateFragmentsDataFromScyllaToDynamoDB } = require('../core/db/migration')

app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(bodyParser.text({
  limit: '100mb',
  type: ['application/*', 'text/*']
}))

http.globalAgent.maxSockets = 10000000000

const securityService = require('./server/services/security')
safe.use(function (req, res, next) {
  securityService.securityAPI(req, res, next)
})
app.set('etag', false)
unSafeRouteur.use(cors())

app.use('/configuration', unSafeRouteur)
app.use('/data/core', safe)
app.use('/data/specific/anonymous', unSafeRouteur)
app.use('/data/specific', safe)
app.use('/data/auth', unSafeRouteur)
app.use('/data', unSafeRouteur)

require('./server/initialiseWebService')(unSafeRouteur)
require('./server/authWebService')(unSafeRouteur)
require('./server/workspaceWebService')(safe)
require('./server/bigdataflowService')(safe)
require('./server/adminWebService')(safe)
let technicalComponentDirectory = require('./server/technicalComponentWebService')(safe, unSafeRouteur)
require('./server/userWebservices')(safe)
require('./server/fragmentWebService')(safe)
require('./server/fileWebservices')(safe)

console.log('connection to ----', configJson.socketServer + '/' + configJson.amqpHost)
let connection = amqpManager.connect([configJson.socketServer + '/' + configJson.amqpHost])
var channelWrapper = connection.createChannel({
  json: true,
  setup: (channel) => {
    // console.log('allo')
    channel.assertExchange('amq.topic', 'topic', {
      durable: true
    })
    channel.assertQueue('process-persist', { exclusive: true, durable: true }).then((q) => {
      channel.bindQueue(q.queue, 'amq.topic', 'process-persist.*')
    })

    channel.assertQueue('process-start', { exclusive: true, durable: true }).then((q) => {
      channel.bindQueue(q.queue, 'amq.topic', 'process-start.*')
    })

    channel.assertQueue('process-end', { exclusive: true, durable: true }).then((q) => {
      channel.bindQueue(q.queue, 'amq.topic', 'process-end.*')
    })

    channel.assertQueue('process-error', { exclusive: true, durable: true }).then((q) => {
      channel.bindQueue(q.queue, 'amq.topic', 'process-error.*')
    })

    onConnect(channel)
  }

})
const onConnect = (channel) => {
  technicalComponentDirectory.setAmqpChannel(channel)
}

technicalComponentDirectory.setAmqpClient(channelWrapper);

// Use async/await to ensure sequential execution
(async () => {
  // await createFragmentTable();
  await createFileTable()
  // await migrateFragmentsDataFromScyllaToDynamoDB();
})()

/// SECURISATION DES REQUETES

app.get('/', function (req, res, next) {
  res.redirect('/ihm/application.html#myWorkspaces')
})
app.use('/ihm', express.static('client/static', {
  etag: false
}))

app.use('/browserify', express.static('browserify'))
app.use('/npm', express.static('node_modules'))

const port = process.env.APP_PORT || 80
app.listen(port, function (err) {
  console.log('max connection', app.maxConnections)
  console.log('serveur started at port', port)
})

app.use((_err, req, res, next) => {
  if (_err) {
    console.log(_err)
    errorHandling(_err, res, next)
  }
})

cron.schedule('0 0 * * *', () => {
  // console.log('running a task each 00H00');
  workspace_lib.cleanGarbage()
})
// clean at startUp
workspace_lib.cleanGarbage()
