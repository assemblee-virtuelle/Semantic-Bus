'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
    waitforTimeout:60000,
    specs: [
        './test/test_integrations/*/*.js'
    ],
    reporterOptions: {
        junit: {
            outputDir: './test/test_result/integ_unit_result'
        }
    }
})
