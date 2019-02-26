'use strict'

const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const amqp = require('amqplib/callback_api')
const safe = express.Router()
const unSafeRouteur = express.Router()
const bodyParser = require('body-parser')
const env = process.env
const httpGet = require('./server/workspaceComponent/restGetJson.js')
const fs = require('fs')
const url = env.CONFIG_URL || 'https://data-players.github.io/StrongBox/public/dev-local-mac.json'
const errorHandling = require('./server/services/errorHandling')

app.use(cors())
app.use(bodyParser.json({
  limit: '10mb'
}))
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}))

process.on('unhandledRejection', (reason) => {
  console.log('Reason: ' + reason)
})

safe.use(bodyParser.json())

http.globalAgent.maxSockets = 1000000000

httpGet.makeRequest('GET', {
  url
}).then(result => {
  const configJson = result.data
  const content = 'module.exports = ' + JSON.stringify(result.data)

  fs.writeFile('configuration.js', content, 'utf8', function (err) {
    if (err) {
      throw err
    } else {
      const securityService = require('./server/services/security')
      safe.use(function (req, res, next) {
        securityService.securityAPI(req, res, next)
      })

      app.set('etag', false)
      unSafeRouteur.use(cors())

      amqp.connect(configJson.socketServer + '/' + configJson.amqpHost, function (err, conn) {
        console.log('AMQP status : ', conn ? 'connected' : 'no connected', err || 'no error')
        conn.createChannel(function (_err, ch) {
          onConnect(ch)
          if (process.env.NOTENGINE != true) {
            ch.assertQueue('work-ask', {
              durable: true
            })
          }
        })
      })
      const onConnect = function (amqpClient) {
        app.use('/configuration', unSafeRouteur)
        app.use('/data/api', unSafeRouteur)
        app.use('/data/specific', safe)

        app.use('/data/auth', unSafeRouteur)
        app.use('/data/core', safe)

        require('./server/initialiseWebService')(unSafeRouteur, amqpClient)
        require('./server/authWebService')(unSafeRouteur)
        require('./server/workspaceWebService')(safe, amqpClient)
        require('./server/technicalComponentWebService')(safe, unSafeRouteur, amqpClient)
        require('./server/userWebservices')(safe, amqpClient)
        require('./server/fragmentWebService')(safe, amqpClient)

        /// SECURISATION DES REQUETES

        app.get('/', function (req, res, next) {
          res.redirect('/ihm/application.html#myWorkspaces')
        })
        app.use('/ihm', express.static('client/static', {
          etag: false
        }))

        app.use('/browserify', express.static('browserify'))
        app.use('/npm', express.static('node_modules'))

        app.listen(process.env.APP_PORT || 8080, function (err) {
          console.log('~~ server started at ', 'port', process.env.APP_PORT || 8080, err, ':', this.address())
          require('../core/timerScheduler').run()
        })
        app.use((_err, req, res, next) => {
          if (_err) {
            errorHandling(_err, res, next)
          }
        })
      }
    }
  })
})
