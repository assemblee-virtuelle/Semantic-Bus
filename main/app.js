/* eslint-disable handle-callback-err */
'use strict'

const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const amqp = require('amqplib/callback_api')
const safe = express.Router()
const unSafeRouteur = express.Router()
const bodyParser = require('body-parser')
const errorHandling = require('../core/helpers/errorHandling')
const configJson = require('./configuration')

app.use(cors())
app.use(bodyParser.json({
  limit: '10mb'
}))
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}))

safe.use(bodyParser.json())

http.globalAgent.maxSockets = 1000000000

const securityService = require('./server/services/security')
safe.use(function (req, res, next) {
  securityService.securityAPI(req, res, next)
})
app.set('etag', false)
unSafeRouteur.use(cors())
console.log('connection to ----', configJson.socketServer + '/' + configJson.amqpHost)
amqp.connect(configJson.socketServer + '/' + configJson.amqpHost, function (err, conn) {
  console.log('AMQP status : ', conn ? 'connected' : 'no connected', err || 'no error')
  conn.createChannel(function (_err, ch) {
    onConnect(ch)
  })
})
const onConnect = function (amqpClient) {
  app.use('/configuration', unSafeRouteur)
  app.use('/data/api', unSafeRouteur)
  app.use('/data/specific', safe)

  app.use('/data/auth', unSafeRouteur)
  app.use('/data/core', safe)

  require('./server/initialiseWebService')(unSafeRouteur)
  require('./server/authWebService')(unSafeRouteur)
  require('./server/workspaceWebService')(safe)
  require('./server/bigdataflowService')(safe)
  require('./server/technicalComponentWebService')(safe, unSafeRouteur, amqpClient)
  require('./server/userWebservices')(safe)
  require('./server/fragmentWebService')(safe)

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
    console.log('serveur started at port', port)
  })

  app.use((_err, req, res, next) => {
    if (_err) {
      console.log(_err)
      errorHandling(_err, res, next)
    }
  })
}
