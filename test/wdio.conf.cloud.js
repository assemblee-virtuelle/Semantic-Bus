'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
  capabilities: [
    {
      browserName: 'chrome',
      platform: 'MACOS',
      version: 'latest'
    },
    {
      browserName: 'firefox',
      platform: 'MACOS',
      version: 'latest'
    }
  ],
  services: ['testingbot'],
  user: process.env.TESTINGBOT_KEY,
  key: process.env.TESTINGBOT_SECRET
})