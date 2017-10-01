'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
  capabilities: [{
      browserName: 'chrome',
      // chromeOptions: {
      //   args: ['--headless', '--disable-gpu', '--window-size=1280,800']
      // }
    }
    // If you want to use other browsers,
    // you may need local Selenium standalone server.
  ],
  services: ['chromedriver'],
  specs: [
    './test/e2e/test_fonctionels/*.js'
  ],
  port: '9515',
  path: '/',
  waitforTimeout: 5000,
  baseUrl:'http://localhost:8080/'
})
