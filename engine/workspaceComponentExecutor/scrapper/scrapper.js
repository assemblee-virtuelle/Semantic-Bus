'use strict'
class Scrapper {
  constructor() {
    // Use dynamic import for webdriverio
    import('webdriverio').then((webdriverio) => {
      this.webdriverio = webdriverio;
    }).catch((err) => {
      console.error('Failed to load webdriverio:', err);
    });
    this.base = require('./wdio.conf.base');
    this.stringReplacer = require('../../utils/stringReplacer');
  }

  getPriceState(specificData, moPrice, recordPrice) {
    if (specificData.key != null) {
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
  waitFor(action, client) {
    return new Promise(function(resolve, reject) {
      client.waitForVisible(action.selector, 20000)
        .then(function(visible) {
          resolve();
        }).catch(err => {
          reject(err)
        })
    })
  };

  simulateClick(action, client, elmt) {
    // console.log(" ------ simulateClick function ----", elmt)
    return new Promise(function(resolve, reject) {
      elmt.click().then(elem => {
        resolve('click done')
      }).catch(e => {
        reject(e)
      })

    })
  };

  getAttr(action, client, elmt) {
    return new Promise(function(resolve, reject) {
      elmt.getAttribute(action.attribut).then(function(elem) {
        resolve(elem)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  getHtml(action, client, elmt) {
    // console.log("----- GET HTML ------")
    return new Promise(function(resolve, reject) {
      elmt.getText().then(function(elem) {
        resolve(elem)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  getText(action, client, elmt) {
    return new Promise(function(resolve, reject) {
      // console.log("--- in get text ----- ")
      elmt.getValue().then(function(elem) {
        resolve(elem)
      }).catch((err) => {
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
        reject(err)
      })
    })
  }

  wait(action, client) {
    // console.log("---- wait ----", action.setValue)
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
      let out = {}
      try {
        let timeout = specificData.timeout == undefined ? 20000 : specificData.timeout * 1000
        for (let action of actions) {
          let effectivSelector = action.selector || 'body';
          let existing = false;
          let scrappingFunction
          switch (action.actionType) {
            case ('scroll'):
              scrappingFunction = this.scroll
              break;
            case ('click'):
              scrappingFunction = this.simulateClick
              break;
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
            if (action.actionType.includes('wait')) {
              await scrappingFunction(action, client);
            } else {
              let elmts = await client.$$(effectivSelector);
              if(elmts.length>0){
                for (let elmt of elmts) {
                  let res = await scrappingFunction(action, client, elmt);
                  if (out[action.action] == undefined) {
                    out[action.action] = [res];
                  } else {
                    out[action.action].push(res);
                  }
                }
              }else{
                out[action.action] = {
                  error: `no element exist for seletor ${effectivSelector}`
                };
              }

            }
          } catch (e) {
            out[action.action] = {
              error: e.message
            };
          }
        }

        // console.log('AGREGATED DATA',data);
        resolve(out);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });

  }

  async makeRequest(specificData, flowData, queryParams) {

    return new Promise(async (resolve, reject) => {
      try {
        let timeout = specificData.timeout == undefined ? 20000 : specificData.timeout * 1000;
        let url = this.stringReplacer.execute(specificData.url, queryParams, flowData);

        let user = specificData.user;
        let key = specificData.key;
        let actions = specificData.scrapperRef;
        let saucelabname = specificData.saucelabname;
        let client;
        let options = Object.assign(this.base.config, {
          capabilities: {
            browserName: 'chrome',
            version: 'latest',
            platform: 'windows 11',
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
          waitforTimeout: timeout,
          // "semanticbusdev@gmail.com"
          // "882170ce-1971-4aa8-9b2d-0d7f89ec7b71"
          user: user,
          key: key,
          // host: 'ondemand.saucelabs.com',
          // port: 80,
          // region: 'us',
          // sauceConnect: true
        });


        client = await this.webdriverio.remote(options);
        let data = flowData || {}
        let depth = 0

        if (user == null || key == null) {
          reject('Scrapper: no connection data')
        } else {



          client.url(url)
            .then(() => {
              let actionsProccessed = actions.map(a=>({...a}));
              for( let action of actionsProccessed){
                if(action.selector){
                  action.selector = this.stringReplacer.execute( action.selector, queryParams, flowData);
                }
                if(action.attribut){
                  action.attribut = this.stringReplacer.execute( action.attribut, queryParams, flowData);
                }
              }
              this.aggregateAction(actionsProccessed, client, data, specificData).then((res) => {
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
