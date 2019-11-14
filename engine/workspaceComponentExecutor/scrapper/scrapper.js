'use strict'
class Scrapper {
  constructor() {
    this.webdriverio = require('webdriverio');
    this.base = require('./wdio.conf.base');
    this.stringReplacer = require('../../utils/stringReplacer');
  }

  getPriceState(specificData, moPrice, recordPrice) {
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
  waitFor(client, action, cb) {
    return new Promise(function(resolve, reject) {
      client.waitForVisible(action.selector, 20000)
        .then(function(visible) {
          cb
        }).catch(err => {
          reject(err)
        })
    })
  };

  simulateClick(action, client, elmt) {
    // console.log(" ------ simulateClick function ----", action)
    return new Promise(function(resolve, reject) {
      // let elmt = await client.$(action.selector)
      elmt.click().then(elem => {
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

  getAttr(action, client, elmt) {
    return new Promise(function(resolve, reject) {
      elmt.getAttribute(action.attribut).then(function(elem) {
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

  getHtml(action, client, elmt) {
    // console.log("IN GET HTML")
    return new Promise(function(resolve, reject) {
      elmt.getText().then(function(elem) {
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

  getText(action, client, elmt) {
    return new Promise(function(resolve, reject) {
      // console.log("--- in get text ----- ")
      elmt.getValue().then(function(elem) {
        // console.log("in return promise ", elem)
        resolve(elem)
      }).catch((err) => {
        // console.log("ERRROR", err)
        reject(err)
      })
    })
  }

  // selectByValue(action, client) {
  //   return new Promise(function(resolve, reject) {
  //     // console.log("--- in get text ----- ")
  //     client.selectByValue(action.selector, action.setValue).then(function(elem) {
  //       // console.log("in return promise ", elem)
  //       resolve(elem)
  //     }).catch((err) => {
  //       // console.log("ERRROR", err);
  //       reject(err)
  //     })
  //   })
  // }

  // Setter

  setValue(action, client, elmt) {
    // console.log("---- set value ----", action.setValue)
    return new Promise((resolve, reject) => {
      elmt.setValue(action.setValue).then((elem) => {
        resolve(elem)
      }).catch((err) => {
        // console.log("ERRROR", err);
        reject(err)
      })
    })
  }

  wait(action, client) {
    // console.log("---- set value ----", action.setValue)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, action.setValue)
    })
  }

  scroll(action, client, elmt) {
    // console.log("---- scroll value ----", action.scrollX, action.scrollY)
    if (action.scrollX == null || action.scrollX == undefined) {
      action.scrollX = 0
    }
    if (action.scrollY == null || action.scrollY == undefined) {
      action.scrollY = 0
    }
    // console.log(action.scrollX, action.scrollY)
    return new Promise(async (resolve, reject) => {
      // var elem = await client.$(action.selector)
      //resolve(elem.scroll(parseInt(action.scrollX), parseInt(action.scrollY)))
      elmt.scroll(parseInt(action.scrollX), parseInt(action.scrollY)).then((elem) => {
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

  aggregateAction(actions, client, data, specificData) {
    // console.log('------   action restante -------- ', actions[depth]);
    return new Promise(async (resolve, reject) => {
      try {
        let timeout = specificData.timeout == undefined ? 20000 : specificData.timeout * 1000
        for(let action of actions){
          let effectivSelector = action.selector || 'body';
          let existing = false;
          let elmt = await client.$(effectivSelector);
          existing = await elmt.isExisting();
          if (!existing) {
            try {
              await elmt.waitForExist(timeout);
              existing = true;
            } catch (e) {
              data[action.action] = {error:"not existing after " + timeout + " ms"};
            }
          }
          if (existing) {
            let scrappingFunction
            switch (action.actionType) {
              case ('scroll'):
                scrappingFunction = this.scroll
                break;
              case ('click'):
                scrappingFunction = this.simulateClick
                break;
                // case ('selectByValue'):
                //   scrappingFunction = this.selectByValue
                //   break;
              case ('setValue'):
                scrappingFunction = this.setValue
                break;
              case ('getHtml'):
                scrappingFunction = this.getHtml
                break;
              case ('getAttr'):
                scrappingFunction = this.getAttr
                break;
              case ('getValue'):
                scrappingFunction = this.getText
                break;
              case ('wait'):
                scrappingFunction = this.wait
                break;
              default:
            }
            try {
              let res = await scrappingFunction(action, client,elmt);
              data[action.action] = res;
            } catch (e) {
              data[action.action] = {error:e.message};
            }
          }
        }
        // console.log('AGREGATED DATA',data);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });

  }

  async makeRequest(specificData, flowData, queryParams) {

    return new Promise(async (resolve, reject) => {
      try {
        let url = this.stringReplacer.execute(specificData.url, queryParams, flowData)

        // console.log('URL', typeof(url), url);
        // throw new Error ('test');

        let user = specificData.user;
        let key = specificData.key;
        let actions = specificData.scrapperRef;
        let saucelabname = specificData.saucelabname;
        let client;
        let options = Object.assign(this.base.config, {
          capabilities: {
            browserName: 'chrome',
            version: '56',
            platform: 'windows 10',
            // tags: ['examples'],
            name: saucelabname || 'Example Test',

            // If using Open Sauce (https://saucelabs.com/opensauce/),
            // capabilities must be tagged as "public" for the jobs's status
            // to update (failed/passed). If omitted on Open Sauce, the job's
            // status will only be marked "Finished." This property can be
            // be omitted for commercial (private) Sauce Labs accounts.
            // Also see https://support.saucelabs.com/customer/portal/articles/2005331-why-do-my-tests-say-%22finished%22-instead-of-%22passed%22-or-%22failed%22-how-do-i-set-the-status-
            // 'public': true
          },
          services: ['sauce'],
          // waitforTimeout:5000,
          // "semanticbusdev@gmail.com"
          // "882170ce-1971-4aa8-9b2d-0d7f89ec7b71"
          user: user,
          key: key,
          // host: 'ondemand.saucelabs.com',
          // port: 80,
          // region: 'us',
          // sauceConnect: true
        });
        // console.log(options);

        client = await this.webdriverio.remote(options);
        let data = flowData || {}
        let depth = 0
        // console.log("----  before recursive ------ ")
        if (user == null || key == null) {
          reject('Scrapper: no connection data')
        } else {
          // console.log('saucelab connection initialisation');


          client.url(url)
            .then(() => {
              // console.log('saucelab connection ok');
              // console.log("before aggregate fonction", actions, client, depth, data);
              this.aggregateAction(actions, client, data, specificData).then((res) => {
                // console.log("--traitmeent terminé final ----", res)
                resolve({
                  data: res
                })
              }).catch(err => {
                // console.log('ERROR AGREGATE');
                reject(err)
              })
            })
            .catch((err) => {
              // console.log('ERROR URL');
              reject(err)
            })


          // client.init().then(() => {
          //   console.log('CLIENT INIT');
          //
          // }).catch(e => {
          //   console.log('ERROR INIT');
          //   reject(err)
          // })
        }

      } catch (e) {
        console.log('ERROR client wdio failed', e);
        reject(e)
      }

    })
  }

  pull(data, flowData, queryParams) {
    // console.log("before scrapping start", data)

    let usableFlowData = flowData == undefined ? undefined : flowData[0].data
    // console.log('scrapp url', url);
    return this.makeRequest(data.specificData, usableFlowData, queryParams)
  }
}

module.exports = new Scrapper()
