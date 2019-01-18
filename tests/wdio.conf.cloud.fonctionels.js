'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
    capabilities: [{
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'latest'
    },{
        browserName: 'firefox',
        platform: 'Windows 10',
        version: 'latest'
    }],
    services: ['sauce'],
    waitforTimeout:5000,
    user: "semanticbusdev@gmail.com",
    key: "882170ce-1971-4aa8-9b2d-0d7f89ec7b71",
    specs: [
        './test/e2e/test_fonctionels/*.js'
    ],
    reporterOptions: {
        junit: {
            outputDir: './test/test_result/fonct_result'
        }
    },
})
