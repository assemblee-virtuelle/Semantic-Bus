'use strict'
class Scrapper {
  constructor () {
    this.type = 'Scrapper'
    this.description = 'Scrapper une page HTML.'
    this.editor = 'scrapper-editor'
    this.graphIcon = 'Scrapper.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/scrapperComponents'
    ]
    this.sift = require('sift')
    this.webdriverio = require('webdriverio')
    this.base = require('../wdio.conf.base')
  }

  getPriceState (specificData, moPrice, recordPrice) {
    if (specificData.sauceLabToken != null) {
      return {
        moPrice: moPrice,
        recordPrice: 0
      }
    } else {
      return {
        moPrice: moPrice,
        recordPrice: recordPrice
      }
    }
  }

  makeRequest (user, key, actions, url, saucelabname, flowData) {
    var client = this.webdriverio.remote(Object.assign(this.base.config, {
      desiredCapabilities: {
        browserName: 'chrome',
        version: '56',
        platform: 'windows 10',
        tags: ['examples'],
        name: saucelabname || 'Example Test',

        // If using Open Sauce (https://saucelabs.com/opensauce/),
        // capabilities must be tagged as "public" for the jobs's status
        // to update (failed/passed). If omitted on Open Sauce, the job's
        // status will only be marked "Finished." This property can be
        // be omitted for commercial (private) Sauce Labs accounts.
        // Also see https://support.saucelabs.com/customer/portal/articles/2005331-why-do-my-tests-say-%22finished%22-instead-of-%22passed%22-or-%22failed%22-how-do-i-set-the-status-
        'public': true
      },
      services: ['sauce'],
      // waitforTimeout:5000,
      // "semanticbusdev@gmail.com"
      // "882170ce-1971-4aa8-9b2d-0d7f89ec7b71"
      user: user,
      key: key,
      host: 'ondemand.saucelabs.com',
      port: 80
    }))

    // var options = {
    //   capabilities: [{
    //       browserName: 'chrome',
    //       // chromeOptions: {
    //       //   args: ['--headless', '--disable-gpu', '--window-size=1280,800']
    //       // }
    //     }
    //     // If you want to use other browsers,
    //     // you may need local Selenium standalone server.
    //   ],
    //   services: ['chromedriver'],
    //   port: '9515',
    //   path: '/',
    //   waitforTimeout: 10000
    // };

    // var client = this.webdriverio.remote(options).init();

    function _waitFor (client, action, cb) {
      return new Promise(function (resolve, reject) {
        client.waitForVisible(action.selector, 20000)
          .then(function (visible) {
            cb
          }).catch(err => {
            reject(err)
          })
      })
    };

    function simulateClick (action, client) {
      // console.log(" ------ simulateClick function ----", action)
      return new Promise(function (resolve, reject) {
        client.element(action.selector).click().then(elem => {
          // console.log('resolve',elem);
          // console.log('resolve');
          resolve('click done')
        }).catch(e => {
          // console.log('reject',e);
          // console.log('reject');
          reject(e)
        })
        //resolve(client.element(action.selector).click())
      })
    };

    function _getAttr (action, client) {
      return new Promise(function (resolve, reject) {
        client.getAttribute(action.selector, action.attribut).then(function (elem) {
          if (!Array.isArray(elem)) {
            elem = [elem]
          }
          // console.log("in return promise ", elem)
          resolve(elem)
        }).catch((err) => {
          reject(err)
        })
      })
    }

    function _getHtml (action, client) {
      // console.log("IN GET HTML")
      return new Promise(function (resolve, reject) {
        client.elements(action.selector).getText().then(function (elem) {
          // console.log("in return promise ", elem)
          if (!Array.isArray(elem)) {
            elem = [elem]
          }
          resolve(elem)
        }).catch((err) => {
          // console.log("ERRROR", err);
          reject(err)
        })
      })
    }

    function _getText (action, client) {
      return new Promise(function (resolve, reject) {
        // console.log("--- in get text ----- ")
        client.elements(action.selector).getValue().then(function (elem) {
          // console.log("in return promise ", elem)
          resolve(elem)
        }).catch((err) => {
          // console.log("ERRROR", err)
          reject(err)
        })
      })
    }

    function _selectByValue (action, client) {
      return new Promise(function (resolve, reject) {
        // console.log("--- in get text ----- ")
        client.selectByValue(action.selector, action.setValue).then(function (elem) {
          // console.log("in return promise ", elem)
          resolve(elem)
        }).catch((err) => {
          // console.log("ERRROR", err);
          reject(err)
        })
      })
    }

    // Setter

    function _setValue (action, client) {
      // console.log("---- set value ----", action.setValue)
      return new Promise((resolve, reject) => {
        client.setValue(action.selector, action.setValue).then((elem) => {
          resolve(elem)
        }).catch((err) => {
          // console.log("ERRROR", err);
          reject(err)
        })
      })
    }

    function _wait (action, client) {
      // console.log("---- set value ----", action.setValue)
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          resolve()
        }, action.setValue)
      })
    }

    function _scroll (action, client) {
      // console.log("---- scroll value ----", action.scrollX, action.scrollY)
      if (action.scrollX == null || action.scrollX == undefined) {
        action.scrollX = 0
      }
      if (action.scrollY == null || action.scrollY == undefined) {
        action.scrollY = 0
      }
      // console.log(action.scrollX, action.scrollY)
      return new Promise(function (resolve, reject) {
        var elem = client.element(action.selector)
        //resolve(elem.scroll(parseInt(action.scrollX), parseInt(action.scrollY)))
        elem.scroll(parseInt(action.scrollX), parseInt(action.scrollY)).then((elem) => {
          resolve(elem)
        }).catch((err) => {
          // console.log("ERRROR", err);
          reject(err)
        })
      }).catch((err) => {
        reject(err)
        //console.log("ERRROR", err)
      })
    }

    function _aggregateAction (actions, client, deeth, data) {
      // console.log('------   action restante -------- ', actions[deeth]);
      return new Promise((resolve, reject) => {
        // console.log(" ------  deeth  ------- ", deeth);
        // console.log('------   tour restant -------- ', (actions.length) - deeth);
        // console.log('action',actions[deeth].actionType);
        let effectivSelector = actions[deeth].selector || 'body'
        client.waitForExist(effectivSelector, 60000)
          .then(function (visible) {
            let scrappingFunction
            switch (actions[deeth].actionType) {
            case ('scroll'):
              scrappingFunction = _scroll
                break;
            case ('click'):
              scrappingFunction = simulateClick
                break;
            case ('selectByValue'):
              scrappingFunction = _selectByValue
                break;
            case ('setValue'):
              scrappingFunction = _setValue
                break;
            case ('getHtml'):
              scrappingFunction = _getHtml
                break;
            case ('getAttr'):
              scrappingFunction = _getAttr
                break;
            case ('getValue'):
              scrappingFunction = _getText
                break;
            case ('wait'):
              scrappingFunction = _wait
                break;
            default:
            }
            return scrappingFunction(actions[deeth], client, deeth)
          }).then(res => {
            // console.log("----- END Of Action");
            // console.log("----- DATA INJECTION");
            data[actions[deeth].action] = res
            return new Promise((resolve, reject) => {
              resolve(true)
            })
          }).catch(err => {
            // console.log("----- CATCH Of Action");
            data[actions[deeth].action] = {
              error: err
            }
            return new Promise((resolve, reject) => {
              if (err.seleniumStack && err.seleniumStack.type == 'UnknownError') {
                resolve(false)
              } else {
                resolve(true)
              }
            })
          }).then((continueDepth) => {
            if (continueDepth) {
              // console.log('----- DEPTH++');
              deeth++
            }

            if (deeth < actions.length) {
              _aggregateAction(actions, client, deeth, data).then((res) => {
                resolve(res)
              })
            } else {
              client.end()
              resolve(data)
            }
          })
      })
    }

    return new Promise(function (resolve, reject) {
      let data = flowData || {}
      let deeth = 0
      // console.log("----  before recursive ------ ")
      if (user == null || key == null) {
        reject('Scrapper: no connection data')
      }
      // console.log('client Init',url);
      client
        .init()
        .url(url)
        .catch((err) => {
          reject(err)
        })
      // console.log("before aggregate fonction", actions, client, deeth, data);
      _aggregateAction(actions, client, deeth, data).then(function (res) {
        // console.log("--traitmeent terminé final ----", res)
        resolve({
          data: res
        })
      }, function (err) {
        reject(err)
      })
    })
  }

  pull (data, flowData) {
    // console.log("before scrapping start", data)
    let url = data.specificData.url

    if (flowData && flowData[0] && flowData[0].data && flowData[0].data.url != undefined) {
      url = flowData[0].data.url
    }
    let usableFlowData = flowData == undefined ? undefined : flowData[0].data
    // console.log('scrapp url', url);
    return this.makeRequest(data.specificData.user, data.specificData.key, data.specificData.scrapperRef, url, data.specificData.saucelabname, usableFlowData)
  }
}

module.exports = new Scrapper()
