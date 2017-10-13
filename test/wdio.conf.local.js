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
    //'./test/e2e/test_fonctionels/connexionInscription.js',
    './test/e2e/test_fonctionels/workspaceAndComponent.js'

  ],
  port: '9515',
  path: '/',
  waitforTimeout: 10000,
  baseUrl:'http://localhost:8080/',
  reporterOptions: {
      junit: {
          outputDir: './test/test_result/fonct_result_local'
      }
  }
})
