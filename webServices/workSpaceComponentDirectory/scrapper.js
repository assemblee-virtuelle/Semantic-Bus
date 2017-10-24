'use strict'
module.exports = {
  type: 'Scrapper ',
  description: 'Scrapper page html',
  editor: 'scrapper-editor',
  graphIcon: 'scrapper.png',
  phantom: require('phantom'),
  sift: require('sift'),
  webdriverio: require('webdriverio'),

  makeRequest: function (actions, url, flowData, flow_before, fix_url) {
    console.log("scrapper start")

    var options = {
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
      port: '9515',
      path: '/',
      waitforTimeout: 10000
    };

    var client = this.webdriverio.remote(options);


    function _waitFor(client, action, cb) {
      return new Promise(function (resolve, reject) {
        client.waitForVisible(action.selector, 15000)
          .then(function (visible) {
            cb
          }).catch(err => {
            reject(err)
          })
      })
    };

    function simulateClick(action, client) {
      console.log(" ------ simulateClick function ----", action)
      return new Promise(function (resolve, reject) {
        resolve(client.element(action.selector).click())
      })
    };

    function _getAttr(action, client) {
      return new Promise(function (resolve, reject) {})
    }

    function _getHtml(action, client) {
      return new Promise(function (resolve, reject) {
        client.element(action.selector).getText().then(function (elem) {
          console.log("in return promise ", elem)
          resolve(elem)
        })
      })
    }



    function _getText(action, client, deeth) {
      return new Promise(function (resolve, reject) {
        console.log("--- in get text ----- ")
        client.element(action.selector).getValue().then(function (elem) {
          console.log("in return promise ", elem)
          resolve(elem)
        })
      })
    }

    //Setter

    function _setValue(action, client) {
      console.log("---- set value ----", action.setValue)
      return new Promise(function (resolve, reject) {
        resolve(client.setValue(action.selector, action.setValue))
      })
    }

    function _scroll(action, client) {
      console.log("---- set value ----", action.setValue)
      return new Promise(function (resolve, reject) {
        resolve(client._scroll(action.selector, action.x, action.y))
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
      console.log('------   action restante -------- ', actions[deeth]);
      return new Promise(function (resolve, reject) {
        console.log(" ------  deeth  ------- ", deeth);
        console.log('------   tour restant -------- ', (actions.length) - deeth);
        if (deeth == actions.length) {
          console.log("---- _aggregateAction finish ---- ", data)
          client.end();
          resolve(data)
        } else {
          if (actions[deeth].actionType) {
            switch (actions[deeth].actionType) {
              case ("getValue"):
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    console.log("visible", visible)
                    setTimeout(function () {
                      _getText(actions[deeth], client, deeth).then(function (res) {
                        console.log("---- get text return promise -----", res)
                        data[actions[deeth].action] = res
                        deeth += 1
                        _aggregateAction(actions, client, deeth, data).then(function (res) {
                          resolve(res)
                        }, function (err) {
                          reject(err)
                        })
                    }).catch(err => {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                      reject(fullError)
                    })
                  },3000)
                })
                break;
              case ("getHtml"):
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    console.log("visible", visible)
                    setTimeout(function () {
                      _getHtml(actions[deeth], client, deeth).then(function (res) {
                        console.log("---- get text return promise -----", res)
                        data[actions[deeth].action] = res
                        deeth += 1
                        _aggregateAction(actions, client, deeth, data).then(function (res) {
                          resolve(res)
                        }, function (err) {
                          reject(err)
                        })
                      }).catch(err => {
                        let fullError = new Error(err);
                        fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                        reject(fullError)
                      })
                    })
                  })
                break;
              case ("getAttr"):
                _waitFor(page, function () {
                  var selector = actions[deeth].selector
                  return page.evaluate(function (selector) {
                    if (document.querySelector(selector) === null) {
                      console.log(document.querySelector(selector))
                      return false
                    } else {
                      console.log(document.querySelector(selector))
                      return true
                    }
                  }, selector)
                }, function () {
                  console.log("The sign-in dialog should be visible now.");
                }).then(function (res) {
                  setTimeout(function () {
                    _getAttr(actions[deeth], page).then(function (res) {
                      console.log(res)
                      data[actions[deeth].action] = res
                      deeth += 1
                      _aggregateAction(actions, client, deeth, data).then(function (res) {
                        resolve(res)
                      }, function (err) {
                        let fullError = new Error(err);
                        fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 4 de  page : " + actions[deeth].action;
                        reject(fullError)
                      })
                    }, function (err) {
                      console.log(" ------ IN ERRRRORRRR ---- ")
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 5 de page : " + actions[deeth].action;
                      reject(fullError)
                    })
                  })
                })
                break;
              case ("setValue"):
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    console.log("visible", visible)
                    setTimeout(function () {
                      _setValue(actions[deeth], client).then(function (res) {
                        console.log("---- get text return promise -----", res)
                        data[actions[deeth].action] = res
                        deeth += 1
                        _aggregateAction(actions, client, deeth, data).then(function (res) {
                          resolve(res)
                        }, function (err) {
                          reject(err)
                        })
                      }).catch(err => {
                        let fullError = new Error(err);
                        fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                        reject(fullError)
                      })
                    }, 3000)
                  })
                break;
              case ("click"):
                console.log("in click")
                client.waitForVisible(actions[deeth].selector, 15000)
                  .then(function (visible) {
                    console.log("visible", actions[deeth].selector, visible)
                    setTimeout(function () {
                      simulateClick(actions[deeth], client, deeth).then(function (res) {
                        console.log("---- get text return promise -----", res)
                        data[actions[deeth].action] = res
                        deeth += 1
                        _aggregateAction(actions, client, deeth, data).then(function (res) {
                          resolve(res)
                        }, function (err) {
                          reject(err)
                        })
                      }).catch(err => {
                        let fullError = new Error(err);
                        fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                        reject(fullError)
                      })
                    }, 3000)
                  })
                break;
            }
          } else {
            let fullError = new Error("Pas d'attribut selectionné");
            fullError.displayMessage = "Scrappeur : Pas d'attribut selectionné";
            reject(fullError)
          }
        }
      })
    }

    return new Promise(function (resolve, reject) {
      let data = {}
      let deeth = 0
      console.log("----  before recursive ------ ")
      client
        .init()
        .url(url)
      _aggregateAction(actions, client, deeth, data).then(function (res) {
        console.log("--traitmeent terminé final ----")
        resolve({
          data: res
        })
      }, function (err) {
        reject(err)
      })
    })
  },

  pull: function (data, flowData) {
    return this.makeRequest(data.specificData.scrappe, data.specificData.url)
  },
}