'use strict'
module.exports = {
  type: 'Scrapper ',
  description: 'Scrapper page html',
  editor: 'scrapper-editor',
  graphIcon: 'scrapper.png',
  phantom: require('phantom'),
  sift: require('sift'),

  makeRequest: function (actions, url, flowData, flow_before, fix_url) {
    console.log("scrapper start")

    var _ph, _page, _outObj

    function _waitFor(_page, testFx, onReady, timeOutMillis) {
      return new Promise(function (resolve, reject) {
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 15000,
          start = new Date().getTime(),
          condition = false,
          interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
              testFx().then(function (res) {
                condition = res
              })
            } else {
              if (!condition) {
                console.log(" ----- CONDITION ERROR ------- ")
                let fullError = new Error("'waitFor()' timeout");
                fullError.displayMessage = "Scrapper : Selecteur introuvable";
                reject(fullError)
                clearInterval(interval);
                _page.close()
              } else {
                console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                typeof (onReady) === "string" ? eval(onReady): onReady();
                clearInterval(interval);
                resolve("done")
              }
            }
          }, 250);
      })
    };

    function simulateClick(action, _page, outObj) {
      return new Promise(function (resolve, reject) {
        return _page.evaluate(function (action) {
            var evt;
            var selector = action.selector
            console.log("---- selector click -----", selector)
            var elt = document.querySelector(selector);
            if (document.createEvent) {
              evt = document.createEvent("MouseEvents");
              evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            }
            (evt) ? elt.dispatchEvent(evt): (elt.click && elt.click());
          }, action).then(function () {
            return outObj.property('urls');
          })
          .then(urls => {
            console.log("URL FLOW");
            resolve(urls[urls.length - 1])
          })
      })
    };

    function _getAttr(action, _page) {
      return new Promise(function (resolve, reject) {
        if (action.attribut != null) {
          _page.evaluate(function (action) {
            var selector = action.selector
            var attr = action.attribut
            return document.querySelector(selector).getAttribute(attr)
          }, action).then(function (result) {
            resolve(result)
          })
        }
      })
    }

    function _getHtml(action, _page) {
      return new Promise(function (resolve, reject) {
        _page.evaluate(function (action) {
          var selector = action.selector
          return document.querySelector(selector)
        }, action).then(function (result) {
          resolve(result)
        })
      })
    }

    function _getText(action, _page, deeth) {
      return new Promise(function (resolve, reject) {
        _page.evaluate(function (action) {
          var selector = action.selector
          return document.querySelector(selector).innerHTML
        }, action).then(function (result) {
          resolve(result)
        })
      })
    }

    //Setter

    function _setValue(action, _page) {
      return new Promise(function (resolve, reject) {
        _page.evaluate(function (action) {
          document.querySelector(action.selector).value = action.value
          return document.querySelector(action.selector).value
        }, action).then(function (res) {
          resolve(res)
        })
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

    function _aggregateAction(actions, page, deeth, data, outObj, _ph) {
      console.log('------   action restante -------- ', actions[deeth]);
      return new Promise(function (resolve, reject) {
        console.log(" ------  deeth  ------- ", deeth);
        console.log('------   tour restant -------- ', (actions.length) - deeth);
        if (deeth == actions.length) {
          console.log("---- _aggregateAction finish ---- ", data)
          resolve(data)
          page.close();
        } else {
          if (actions[deeth].actionType) {
            switch (actions[deeth].actionType) {
              case ("getValue"):
                _waitFor(page, function () {
                  console.log("getValue")
                  var selector = actions[deeth].selector
                  console.log(selector)
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
                  console.log("The sign-in dialog should be visible now");
                }).then(function (res) {
                  _getText(actions[deeth], page, deeth).then(function (res) {
                    data[actions[deeth].action] = res
                    deeth += 1
                    _aggregateAction(actions, page, deeth, data, outObj, _ph).then(function (res) {
                      resolve(res)
                    }, function (err) {
                      reject(err)
                    })
                  })
                }, function (err) {
                  console.log(" ------ IN ERRRRORRRR ---- ")
                  let fullError = new Error(err);
                  fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 1 de  page : " + actions[deeth].action;
                  reject(fullError)
                })
                break;
              case ("getHtml"):
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
                  _getHtml(actions[deeth], page, deeth).then(function (res) {
                    data[actions[deeth].action] = res
                    deeth += 1
                    _aggregateAction(actions, page, deeth, data, outObj, _ph).then(function (res) {
                      resolve(res)
                    }, function (err) {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 2 de  page : " + actions[deeth].action;
                      reject(fullError)
                    })
                  })
                }, function (err) {
                  console.log(" ------ IN ERRRRORRRR ---- ")
                  let fullError = new Error(err);
                  fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 3 de  page : " + actions[deeth].action;
                  reject(fullError)
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
                  _getAttr(actions[deeth], page).then(function (res) {
                    console.log(res)
                    data[actions[deeth].action] = res
                    deeth += 1
                    _aggregateAction(actions, page, deeth, data, outObj, _ph).then(function (res) {
                      resolve(res)
                    }, function (err) {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 4 de  page : " + actions[deeth].action;
                      reject(fullError)
                    })
                  })
                }, function (err) {
                  console.log(" ------ IN ERRRRORRRR ---- ")
                  let fullError = new Error(err);
                  fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 5 de page : " + actions[deeth].action;
                  reject(fullError)
                })
                break;
              case ("setValue"):
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
                  _setValue(actions[deeth], page).then(function (res) {
                    console.log(res)
                    data[actions[deeth].action] = res
                    deeth += 1
                    _aggregateAction(actions, page, deeth, data, outObj, _ph).then(function (res) {
                      resolve(res)
                    }, function (err) {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 6 de page : " + actions[deeth + 1].action;
                      reject(fullError)
                    })
                  })
                }, function (err) {
                  console.log(" ------ IN ERRRRORRRR ---- ")
                  let fullError = new Error(err);
                  fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 7 de page : " + actions[deeth].action;
                  reject(fullError)
                })
                break;
              case ("click"):
                _waitFor(page, function () {
                  var selector = actions[deeth].selector
                  return page.evaluate(function (selector) {
                    console.log(document.querySelector(selector), selector)
                    if (document.querySelector(selector) === null) {
                      console.log("------- url --------", document.URL)
                      return false
                    } else {
                      console.log(document.querySelector(selector))
                      return true
                    }
                  }, selector)
                }, function () {
                  console.log("The sign-in dialog should be visible now.");
                }).then(function (res) {
                  console.log("In click");
                  simulateClick(actions[deeth], page, outObj).then(function (resultat) {
                    console.log("res click test", resultat)
                    deeth += 1
                    page.open(res)
                    _aggregateAction(actions, page, deeth, data, outObj, _ph).then(function (res) {
                      resolve(res)
                    }, function (err) {
                      let fullError = new Error(err);
                      fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 8 de page : " + actions[deeth].action;
                      reject(fullError)
                    })
                  })
                }, function (err) {
                  console.log(" ------ IN ERRRRORRRR ---- ")
                  let fullError = new Error(err);
                  fullError.displayMessage = "Scrappeur : Erreur lors de votre traitement 9 de page : " + actions[deeth].action;
                  reject(fullError)
                })
            }
          }else{
            let fullError = new Error("Pas d'attribut selectionné");
            fullError.displayMessage = "Scrappeur : Pas d'attribut selectionné";
            reject(fullError)
          }
        }
      })
    }

    return new Promise(function (resolve, reject) {
      this.phantom.create(['--ignore-ssl-errors=yes', '--web-security=false']).then(ph => {
        _ph = ph;
        return _ph.createPage();
      }).then(page => {
        _page = page;
        _outObj = _ph.createOutObject();
        _outObj.urls = []
        _page.setting('userAgent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36');
        _page.property(
          'onResourceRequested',
          function (requestData, networkRequest, out) {
            out.urls.push(requestData.url);
          },
          _outObj
        );
        return _page.open(url)
      }).then(status => {
        if (status) {
          let data = {}
          let deeth = 0
          console.log("----  before recursive ------ ")
          _aggregateAction(actions, _page, deeth, data, _outObj, _ph).then(function (res) {
            console.log("--traitmeent terminé final ----")
            resolve({
              data: res
            })
          }, function (err) {
            reject(err)
          })
        }
      })
    }.bind(this))
  },

  pull: function (data, flowData) {
    return this.makeRequest(data.specificData.scrappe, data.specificData.url)
  },
}