'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
    capabilities: [{
        browserName: 'firefox',
        platform: 'Windows 7',
        version: '54'
    }, ],
    services: ['sauce'],
    waitforTimeout:300000,
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
