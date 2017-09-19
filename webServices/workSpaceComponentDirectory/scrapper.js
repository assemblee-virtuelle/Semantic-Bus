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
                console.log(res)
                condition = res
              })
            } else {
              if (!condition) {
                console.log("'waitFor()' timeout");
                reject("this.phantom.exit(1)")
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
            console.log(urls.indexOf('https://agence.voyages-sncf.com/user/signin?ckoflag=0'))
            // mettre index of pour recuper url rensigner dans le front 
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

    // //Setter

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


    function _aggregateAction(actions, page, deeth, data, outObj, _ph, cb) {
      // return new Promise(function (resolve, reject) {
        console.log(" ------  deeth  ------- ", deeth);
        console.log('------   tour restant -------- ', (actions.length) - deeth);
        if (deeth == actions.length) {
          console.log("terminé", data)
          page.close();
          return cb(data)
        } else {
          switch (actions[deeth].actionType) {
            case ("getValue"):
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
                _getText(actions[deeth], page, deeth).then(function (res) {
                  data[actions[deeth].action] = res
                  deeth += 1
                  
                  _aggregateAction(actions, page, deeth, data, outObj, _ph, cb)
                })
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
                  
                  _aggregateAction(actions, page, deeth, data, outObj, _ph, cb)
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
                _getAttr(actions[deeth], page).then(function (res) {
                  console.log(res)
                  data[actions[deeth].action] = res
                  deeth += 1
                  
                  _aggregateAction(actions, page, deeth, data, outObj, _ph, cb)
                })
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
                  
                  _aggregateAction(actions, page, deeth, data, outObj, _ph, cb)
                })
              })
              break;
            case ("click"):
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
                console.log(" IN click");
                simulateClick(actions[deeth], page, outObj).then(function (res) {
                  console.log("res click test", res)
                  deeth += 1
                  page.open(res)
                  _aggregateAction(actions, page, deeth, data, outObj, _ph, cb)
                })
              })
              break;
          }
        }
      // })
    }

    function callBackScrapping(data){
      console.log("in callback final ===", data)
      return new Promise(function(resolve,reject){
        resolve({data: data})
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
          _outObj,
        );
        return _page.open(url)
      }).then(status => {
        if (status) {
            let data = {}
            let deeth = 0
            console.log("----  before recursive ------ ")
            _aggregateAction(actions, _page, deeth, data, _outObj, _ph, callBackScrapping)
        }
      })
    }.bind(this))
  },


  // pull: function () {
  pull: function (data, flowData) {
    // console.log(data.specificData.scrappe[0])
    // var data = {}
    // data['specificData'] = {}
    // data.specificData.url = 'https://www.voyages-sncf.com/'
    // data.specificData.actions = [{
    //     action: "test2",
    //     attribut: 'class',
    //     actionName: 'getAttr',
    //     selector: '.ico-train',
    //     name_number: null
    //   },
    //   {
    //     action: "test3",
    //     actionName: 'click',
    //     selector: '.ico-train-vol-hotel',
    //     name_number: null
    //   },
    //   {
    //     action: "test90",
    //     attribut: 'class',
    //     actionName: 'getAttr',
    //     selector: '#new-homepage-search-wizard',
    //     name_number: null
    //   },
    //   {
    //     action: "test33",
    //     actionName: 'click',
    //     selector: '#ccl-label',
    //     name_number: null
    //   },
    //   {
    //     action: "test33",
    //     value: 'test',
    //     actionName: 'setValue',
    //     selector: '#signin-loginid',
    //     name_number: null
    //   },
    //   {
    //     action: "test43",
    //     value: 'test',
    //     actionName: 'setValue',
    //     selector: '#signin-password',
    //     name_number: null
    //   },
    //   {
    //     action: "test73",
    //     attribut: 'class',
    //     actionName: 'getAttr',
    //     selector: '.secondary',
    //     name_number: null
    //   },
    // ]

    return this.makeRequest(data.specificData.scrappe, data.specificData.url)
    // return this.makeRequest(flowData, data.specificData.url, data.specificData.flow_before, data.specificData.fix_url, data.specificData.scrappe);
  },
}