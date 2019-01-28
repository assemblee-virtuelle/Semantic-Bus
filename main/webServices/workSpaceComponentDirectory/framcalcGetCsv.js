'use strict'

const csvToJson = require('csvtojson')
const fetch = require('node-fetch')

module.exports = {
  type: 'Framacalc',
  description: 'Interroger une feuille de calcul Framacalc/Ethercalc qui fournit un flux CSV.',
  editor: 'framacalc-get-csv-editor',
  graphIcon: 'Framacalc.png',
  tags: [
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/APIComponents'
  ],

  /**
   * @param {string} url
   * @param {number} offset
   * @return {Promise}
   */
  makeRequest: function (url, offset) {
    return this.fetchCSV(url)
      .then(rawCSV => this.processCSV(rawCSV, offset))
  },

  /**
   * @param {string} url
   * @return {Promise<string>}
   */
  fetchCSV: function (url) {
    return fetch(this.normalizeUrl(url))
      .then(response => {
        const hasResponseFailed = response.status >= 400
        if (hasResponseFailed) {
          return Promise.reject(`Request to ${response.url} failed with HTTP ${response.status}`)
        } else {
          return response.text()
        }
      })
  },

  /**
   * @param {string} url
   * @return {string}
   */
  normalizeUrl: function (url) {
    if (url.startsWith('http')) {
      if (url.endsWith('.csv')) {
        return url
      } else {
        return `${url}.csv`
      }
    } else {
      if (url.endsWith('.csv')) {
        return `https://framacalc.org/${url}`
      } else {
        return `https://framacalc.org/${url}.csv`
      }
    }
  },

  /**
   * @param {string} rawCSV
   * @param {number} offset
   * @return {Promise<FramacalcResult>}
   */
  processCSV: function (rawCSV, offset) {
    return new Promise((resolve, reject) => {
      csvToJson({ noheader: true })
        .fromString(rawCSV)
        .on('end_parsed', (jsonArr) => {
          jsonArr.splice(0, offset)

          resolve({ data: jsonArr })
        })
        .on('error', error => reject({ data: error }))
    })
  },

  /**
   * @param {FramacalcData} data
   * @return {Promise<FramacalcResult>}
   */
  pull: function (data) {
    return this.makeRequest(data.specificData.key, data.specificData.offset)
  }
}
