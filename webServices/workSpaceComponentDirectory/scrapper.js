'use strict'
module.exports = {
  type: 'Scrapper ',
  description: 'Scrapper page html',
  editor: 'scrapper-editor',
  graphIcon: 'scrapper.png',
  tags:[
    'http://semantic-bus.org/data/tags/inComponents',
    'http://semantic-bus.org/data/tags/scrapperComponents'
  ],
  phantom: require('phantom'),
  sift: require('sift'),
  webdriverio: require('webdriverio'),
  base: require('../../test/wdio.conf.base'),
  makeRequest: function (user, key, actions, url,  saucelabname, flowData, flow_before, fix_url) {
    //console.log("scrapper start saucelabname", saucelabname)


    // var config = Object.assign(this.base.config, {
    //     capabilities: [{
    //         browserName: 'chrome',
    //         platform: 'Windows 10',
    //         version: 'latest'
    //     }],
    //     services: ['sauce'],
    //     waitforTimeout:5000,
    //     user: "semanticbusdev@gmail.com",
    //     key: "882170ce-1971-4aa8-9b2d-0d7f89ec7b71",
    // })



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


    function _waitFor(client, action, cb) {
      return new Promise(function (resolve, reject) {
        client.waitForVisible(action.selector, 20000)
          .then(function (visible) {
            cb
          }).catch(err => {
            reject(err)
          })
      })
    };

    function simulateClick(action, client) {
      //console.log(" ------ simulateClick function ----", action)
      return new Promise(function (resolve, reject) {
        resolve(client.element(action.selector).click())
      })
    };

    function _getAttr(action, client) {
      //console.log("in action", action)
      return new Promise(function (resolve, reject) {
        //console.log("BEFOREEEEEE action", action)
        client.getAttribute(action.selector, action.attribut).then(function (elem) {
          //console.log("in return promise ", elem)
          resolve(elem)
        })
      })
    }

    function _getHtml(action, client) {
      return new Promise(function (resolve, reject) {
        client.element(action.selector).getText().then(function (elem) {
          //console.log("in return promise ", elem)
          resolve(elem)
        })
      })
    }



    function _getText(action, client, deeth) {
      return new Promise(function (resolve, reject) {
        //console.log("--- in get text ----- ")
        client.element(action.selector).getValue().then(function (elem) {
          //console.log("in return promise ", elem)
          resolve(elem)
        })
      })
    }


    function _selectByValue(action, client, deeth) {
      return new Promise(function (resolve, reject) {
        //console.log("--- in get text ----- ")
        client.selectByValue(action.selector, action.setValue).then(function (elem) {
          //console.log("in return promise ", elem)
          resolve(elem)
        })
      })
    }


    //Setter

    function _setValue(action, client) {
      //console.log("---- set value ----", action.setValue)
      return new Promise(function (resolve, reject) {
        resolve(client.setValue(action.selector, action.setValue))
      })
    }

    function _scroll(action, client) {
      //console.log("---- scroll value ----", action.scrollX, action.scrollY)
      if (action.scrollX == null || action.scrollX == undefined) {
        action.scrollX = 0
      }
      if (action.scrollY == null || action.scrollY == undefined) {
        action.scrollY = 0
      }
      //console.log(action.scrollX, action.scrollY)
      return new Promise(function (resolve, reject) {
        var elem = client.element(action.selector)
        resolve(elem.scroll(parseInt(action.scrollX), parseInt(action.scrollY)))
      })
    }



    // // Gesture of cooki

    // function _addCookie(phantom, cookie) {
    //   phantom.addCookie({
    //     cookie
    //   })
    // };

    // function _deleteCookie(phantom, cookie) {
    //   phantom.deleteCookie({
    //     cookie
    //   })
    // };

    // function _clearCookies(phantom, cookie) {
    //   phantom.clearCookies({
    //     cookie
    //   })
    // };

    function _aggregateAction(actions, client, deeth, data) {
      //console.log('------   action restante -------- ', actions[deeth]);
      return new Promise(function (resolve, reject) {
        //console.log(" ------  deeth  ------- ", deeth);
        //console.log('------   tour restant -------- ', (actions.length) - deeth);
        if (deeth == actions.length) {
          //console.log("---- _aggregateAction finish ---- ", data)
          client.end();
          resolve(data)
        } else {
          if (actions[deeth].actionType) {
            //console.log("type", actions[deeth].actionType)
            switch (actions[deeth].actionType) {
              case ("getValue"):
                client.waitForVisible(actions[deeth].selector, 25000)
                  .then(function (visible) {
                    //console.log("visible", visible)
                    setTimeout(function () {
                      _getText(actions[deeth], client, deeth).then(function (res) {
                        //console.log("---- get text return promise -----", res)
                        data[actions[deeth].action] = res
                        deeth += 1
                        _aggregateAction(actions, client, deeth, data).then(function (res) {
                          resolve(res)
                        }, function (err) {
                          reject(err)
                          client.end();
                        })
                      }).catch(err => {
                        let fullError = new Error(err);
                        fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                        reject(fullError)
                        client.end();
                      })
                    }, 3000)
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  });
                break;
              case ("getHtml"):
                client.waitForVisible(actions[deeth].selector, 25000)
                  .then(function (visible) {
                    //console.log("visible", visible)
                    setTimeout(function () {
                      _getHtml(actions[deeth], client, deeth).then(function (res) {
                        //console.log("---- get text return promise -----", res)
                        data[actions[deeth].action] = res
                        deeth += 1
                        _aggregateAction(actions, client, deeth, data).then(function (res) {
                          resolve(res)
                        }, function (err) {
                          reject(err)
                          client.end();
                        })
                      }).catch(err => {
                        let fullError = new Error(err);
                        fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de page : " + actions[deeth].action;
                        reject(fullError)
                        client.end();
                      })
                    })
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  })
                break;
              case ("getAttr"):
                client.waitForVisible(actions[deeth].selector, 25000)
                .then(function (visible) {
                  //console.log("visible", visible)
                  setTimeout(function () {
                    _getAttr(actions[deeth], client).then(function (res) {
                      //console.log("---- get text return promise -----", res)
                      data[actions[deeth].action] = res
                      deeth += 1
                      _aggregateAction(actions, client, deeth, data).then(function (res) {
                        resolve(res)
                      }, function (err) {
                        reject(err)
                        client.end();
                      })
                    }).catch(err => {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de page : " + actions[deeth].action;
                      reject(fullError)
                      client.end();
                    })
                  })
                }, (err) => {
                  //console.log("not visible", err)
                  let fullError = new Error(err);
                  fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                  reject(fullError)
                  client.end();
                })
              break;
              case ("setValue"):
                client.waitForVisible(actions[deeth].selector, 25000)
                  .then(function (visible) {
                    //console.log("visible", visible)
                    // setTimeout(function () {
                    _setValue(actions[deeth], client).then(function (res) {
                      //console.log("---- get text return promise -----", res)
                      data[actions[deeth].action] = res
                      deeth += 1
                      _aggregateAction(actions, client, deeth, data).then(function (res) {
                        resolve(res)
                      }, function (err) {
                        reject(err)
                        client.end();
                      })
                    }).catch(err => {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                      reject(fullError)
                      client.end();
                    })
                    // }, 3000)
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  });
                break;
              case ("selectByValue"):
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    //console.log("visible", visible)
                    // setTimeout(function () {
                    _selectByValue(actions[deeth], client).then(function (res) {
                      //console.log("---- get selectByValue return promise -----", res)
                      data[actions[deeth].action] = res
                      deeth += 1
                      _aggregateAction(actions, client, deeth, data).then(function (res) {
                        resolve(res)
                      }, function (err) {
                        reject(err)
                        client.end();
                      })
                    }).catch(err => {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                      reject(fullError)
                      client.end();
                    })
                    // }, 3000)
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  });
                break;
              case ("scroll"):
                //console.log("in scroll")
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    //console.log("visible", actions[deeth].selector, visible)
                    // setTimeout(function () {
                    _scroll(actions[deeth], client, deeth).then(function (res) {
                      //console.log("---- get scroll return promise -----", res)
                      data[actions[deeth].action] = res
                      deeth += 1
                      _aggregateAction(actions, client, deeth, data).then(function (res) {
                        resolve(res)
                      }, function (err) {
                        reject(err)
                        client.end();
                      })
                    }).catch(err => {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement de  page : " + actions[deeth].action;
                      reject(fullError)
                      client.end();
                    })
                    // }, 3000)
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  });
                break;
              case ("click"):
                //console.log("in click")
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    //console.log("visible", actions[deeth].selector, visible)
                    // setTimeout(function () {
                    simulateClick(actions[deeth], client, deeth).then(function (res) {
                      //console.log("---- get text return promise -----", res)
                      data[actions[deeth].action] = res
                      deeth += 1
                      _aggregateAction(actions, client, deeth, data).then(function (res) {
                        resolve(res)
                      }, function (err) {
                        reject(err)
                        client.end();
                      })
                    }).catch(err => {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                      reject(fullError)
                      client.end();
                    })
                    // }, 3000)
                  }, (err) => {
                    //console.log("not visible", err)
                    let fullError = new Error(err);
                    fullError.displayMessage = "Scrappeur : Element pas visible : " + actions[deeth].action;
                    reject(fullError)
                    client.end();
                  });
                break;
            }
          } else {
            let fullError = new Error("Pas d'attribut selectionné");
            fullError.displayMessage = "Scrappeur : Pas d'attribut selectionné";
            reject(fullError)
            client.end();
          }
        }
      })
    }

    return new Promise(function (resolve, reject) {
      let data = {}
      let deeth = 0
      //console.log("----  before recursive ------ ")
      if (user == null || key == null) {
        reject("Scrapper: no connection data")
      }
      client
      .init()
      .url(url)
      .catch((err) => {
        reject(err)
      });
      _aggregateAction(actions, client, deeth, data).then(function (res) {
        //console.log("--traitmeent terminé final ----")
        resolve({
          data: res
        })
      }, function (err) {
        reject(err)
      })
    })
  },

  pull: function (data, flowData) {
    //console.log("before scrapping start", data.specificData.saucelabname)
    return this.makeRequest(data.specificData.user, data.specificData.key, data.specificData.scrappe, data.specificData.url, data.specificData.saucelabname)
  },
}
