'use strict'
module.exports = {
  type: 'Scrapper ',
  description: 'Scrapper page html',
  editor: 'scrapper-editor',
  phantom: require('phantom'),
  sift: require('sift'),

  makeRequest: function (actions, url, flowData, flow_before, fix_url) {
    console.log("In scrapper")
    var _ph, _page, _outObj;

    // Wait

    function _waitFor(testFx, onReady, timeOutMillis) {
      return new Promise(function (resolve, reject) {
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
          start = new Date().getTime(),
          condition = false,
          interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
              // If not time-out yet and condition not yet fulfilled
              testFx().then(function (res) {
                console.log(res)
                condition = res
              })
            } else {
              if (!condition) {
                // If condition still not fulfilled (timeout but condition is 'false')
                console.log("'waitFor()' timeout");
                reject("this.phantom.exit(1)")
                this.phantom.exit(1);
              } else {
                // Condition fulfilled (timeout and/or condition is 'true')
                console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                typeof (onReady) === "string" ? eval(onReady): onReady(); //< Do what it's supposed to do once the condition is fulfilled
                clearInterval(interval); //< Stop this interval
                resolve("done")
              }
            }
          }, 250);
      })
    };

    //click natif js

    function simulateClick(action, _page, outObj) {
      // switch case for name class category 
      console.log(outObj)
      return new Promise(function (resolve, reject) {
        _page.evaluate(function (action) {
          var evt;
          var selector = action.selector
          var elt = document.querySelector(selector);
          if (document.createEvent) {
            evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          }
          (evt) ? elt.dispatchEvent(evt): (elt.click && elt.click());
        }, action).then(function () {
          outObj.urls = [];
          _page.property('onUrlChanged', function (targetUrl) {
            console.log(targetUrl)
            outObj.urls.push(targetUrl)
          }, outObj)
        })
      })
    };


    //Getter

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

    // function _setAttr(action, _page) {
    //   _page.evaluate(function (action) {
    //     return $(action.selector).attr(action.attribut, action.value);
    //   }, action)
    // }

    // function _setText(action, _page) {
    //   _page.evaluate(function (action) {
    //     return $(action.selector).text(action.value);
    //   }, action)
    // }

    // function _setHtml(action, _page) {
    //   _page.evaluate(function (action) {
    //     return $(action.selector).html(action.value);
    //   }, action)
    // }

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


    function _aggregateAction(actions, page, deeth, data, outObj) {
      /// do a structuration data function qui prend en parametre l'action et la deeth 
      console.log("recursive deeth |" + deeth);
      console.log("incremente data", data);
      console.log('tour restant |', (actions.length) - deeth);
      console.log('egalite deeth et size table', deeth == actions.length - 1)
      if (deeth == actions.length) {
        console.log("terminé", data)
      } else {
        console.log(outObj)
        switch (actions[deeth].actionName) {
          case ("getValue"):
            _getText(actions[deeth], page, deeth).then(function (res) {
              data[actions[deeth].action] = res
              deeth += 1
              _aggregateAction(actions, page, deeth, data)
            })
            break;
          case ("getHtml"):
            _getHtml(actions[deeth], page, deeth).then(function (res) {
              data[actions[deeth].action] = res
              deeth += 1
              _aggregateAction(actions, page, deeth, data)
            })
            break;
          case ("getAttr"):
            _getAttr(actions[deeth], page).then(function (res) {
              console.log(res)
              data[actions[deeth].action] = res
              deeth += 1
              _aggregateAction(actions, page, deeth, data)
            })
            break;
          case ("setValue"):
            _setText(actions[deeth], page).then(function (res) {
              data[actions[deeth].action] = res
              deeth += 1
              _aggregateAction(actions, page, deeth, data)
            })
            break;
          case ("setHtml"):
            _setHtml(actions[deeth], page).then(function (res) {
              data[actions[deeth].action] = res
              deeth += 1
              _aggregateAction(actions, page, deeth, data)
            })

            break;
          case ("setAttr"):
            _setAttr(actions[deeth], page).then(function (res) {
              data[actions[deeth].action] = res
              deeth += 1
              _aggregateAction(actions, page, deeth, data)
            })
            break;
          case ("waitSelector"):
            _waitFor(function () {
              // Check in the page if a specific element is now visible
              return _page.evaluate(function () {
                return $(selector).is(":visible");
                _aggregateAction(actions, res, deeth, data)
              })
            })
            break;
          case ("click"):
            console.log("IN CLICK", outObj)
            simulateClick(actions[deeth], page, outObj).then(function (res) {
              console.log("url", res)
              deeth += 1
              _aggregateAction(actions, res, deeth, data)
            })
            // recursiveFunction(actions, deeth)
            break;
        }
      }
    }

    return new Promise(function (resolve, reject) {
      this.phantom.create(['--ignore-ssl-errors=yes', '--web-security=false']).then(ph => {
        _ph = ph;
        return _ph.createPage();
      }).then(page => {
        _page = page;
        
        return _page.open(url)
      }).then(status => {
        var outObj = _ph.createOutObject();
        if (status) {
          let data = {}
          let deeth = 0
          // _page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {
          console.log("before recursive")
          _aggregateAction(actions, _page, deeth, data, outObj)
          // })
        }
      })
    }.bind(this))



    // // description du comportement du router de scrapperjs
    // return new Promise(function (resolve, reject) {
    //   this.phantom.create(['--ignore-ssl-errors=yes', '--web-security=no']).then(ph => {
    //     _ph = ph;
    //     return _ph.createPage();
    //   }).then(page => {
    //     _page = page;
    //     return _page.open(url)
    //   }).then(status => {
    //     if (status) {
    //       console.log(status)
    //       waitFor(function () {
    //         // Check in the page if a specific element is now visible
    //         return _page.evaluate(function () {
    //           return $("#page-content").is(":visible");
    //         })
    //       }, function () {
    //         console.log("The sign-in dialog should be visible now.");
    //       }).then(function (res) {
    //         console.log(res)
    // var i = 0
    // var final_table = []
    // scrappes.forEach(function (elem) {
    //   console.log(elem.attribut)
    //   _page.evaluate(function (elem) {
    //     return {
    //       // groupe: elem.groupe,
    //       field: elem.field,
    //       type: elem.attribut,
    //       group: elem.group,
    //       value: $(elem.field).text()
    //     }
    //   },elem).then(function (res) {
    //     final_table.push(res)
    //     i++
    //     console.log(i, scrappes.length)
    //     if (i == scrappes.length) {
    //       resolve({
    //         data: final_table
    //       })
    //     }
    //   })
    // })
    //       })
    //     } else {
    //       resolve({
    //         data: "error with url"
    //       })
    //     }
    //   })
    // }.bind(this))
  },


  pull: function () {
    // pull: function (data, flowData) {
    // console.log('scrapper | pull : ', data.specificData);
    var data = {}
    data['specificData'] = {}
    data.specificData.url = 'http://www.avenue73.com/coiffeur-st-julien-de-concelles/'
    data.specificData.actions = [{
        action: "test2",
        attribut: 'class',
        actionName: 'getAttr',
        selector: '.logo_standard',
        name_number: null
      },
      {
        action: "test3",
        actionName: 'click',
        selector: '.sf-with-ul',
        name_number: null
      }
    ]
    console.log(data)
    return this.makeRequest(data.specificData.actions, data.specificData.url)
    // return this.makeRequest(flowData, data.specificData.url, data.specificData.flow_before, data.specificData.fix_url, data.specificData.scrappe);
  },
}

/// Les composant d'actions induise une profondeur dans l'arbo

/// Document.querySelector('.-actions')