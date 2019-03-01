'use strict';

class FramcalcGetCsv {
  constructor () {
    this.csvToJson = require('csvtojson')
    this.fetch = require('node-fetch')
  }

  /**
   * @param {string} url
   * @param {number} offset
   * @return {Promise}
   */
  makeRequest (url, offset) {
    return this.fetchCSV(url)
      .then(rawCSV => this.processCSV(rawCSV, offset))
  }

  /**
   * @param {string} url
   * @return {Promise<string>}
   */
  fetchCSV (url) {
    return this.fetch(this.normalizeUrl(url))
      .then(response => {
        const hasResponseFailed = response.status >= 400
        if (hasResponseFailed) {
          return Promise.reject(`Request to ${response.url} failed with HTTP ${response.status}`)
        } else {
          return response.text()
        }
      })
  }

  /**
   * @param {string} url
   * @return {string}
   */
  normalizeUrl (url) {
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
  }

  /**
   * @param {string} rawCSV
   * @param {number} offset
   * @return {Promise<FramacalcResult>}
   */
  processCSV (rawCSV, offset) {
    return new Promise((resolve, reject) => {
      this.csvToJson({ noheader: true })
        .fromString(rawCSV)
        .on('end_parsed', (jsonArr) => {
          jsonArr.splice(0, offset)

          resolve({ data: jsonArr })
        })
        .on('error', error => reject({ data: error }))
    })
  }

  /**
   * @param {FramacalcData} data
   * @return {Promise<FramacalcResult>}
   */
  pull (data) {
    return this.makeRequest(data.specificData.key, data.specificData.offset)
  }
}

module.exports = new FramcalcGetCsv()
