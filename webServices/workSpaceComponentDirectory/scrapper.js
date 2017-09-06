'use strict'
module.exports = {
  type: 'Scrapper ',
  description: 'Scrapper page html',
  editor: 'scrapper-editor',
  phantom: require('phantom'),
  sift: require('sift'),
  ////function qui permet de netoyyer le tableau de fin//////

  ////requete principale//////
  makeRequest: function (flowData, url, flow_before, fix_url, scrappes) {
    // console.log("flowData |", flowData, "attribut |", scrappes, "url |", "flow_before |", flow_before, "fix_url |", fix_url)
    //nous permet de recuperer le contexte a tout moment

    //
    var _ph, _page, _outObj;


    // wait for apparation of special element 
    function waitFor(testFx, onReady, timeOutMillis) {
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
          }, 250); //< repeat check every 250ms
      })
    };


    // Include JQUERY 
    function includJS(page, cb) {
      page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {
        cb
      })
    };

    function addCookie(phantom, cookie) {
      phantom.addCookie({
        cookie
      })
    };

    function deleteCookie(phantom, cookie) {
      phantom.deleteCookie({
        cookie
      })
    };

    function clearCookies(phantom, cookie) {
      phantom.clearCookies({
        cookie
      })
    };


    //description du comportement du router de scrapperjs
    return new Promise(function (resolve, reject) {
      this.phantom.create(['--ignore-ssl-errors=yes', '--web-security=no']).then(ph => {
        _ph = ph;
        return _ph.createPage();
      }).then(page => {
        _page = page;
        return _page.open(url)
      }).then(status => {
        if (status) {
          console.log(status)
          waitFor(function () {
            // Check in the page if a specific element is now visible
            return _page.evaluate(function () {
              return $("#page-content").is(":visible");
            })
          }, function () {
            console.log("The sign-in dialog should be visible now.");
          }).then(function (res) {
            console.log(res)
            var i = 0
            var final_table = []
            scrappes.forEach(function (elem) {
              console.log(elem.attribut)
              _page.evaluate(function (elem) {
                return {
                  // groupe: elem.groupe,
                  field: elem.field,
                  type: elem.attribut,
                  group: elem.group,
                  value: $(elem.field).text()
                }
              }, elem).then(function (res) {
                final_table.push(res)
                i++
                console.log(i, scrappes.length)
                if (i == scrappes.length) {
                  resolve({
                    data: final_table
                  })
                }
              })
            })
          })
        } else {
          resolve({
            data: "error with url"
          })
        }
      })
    }.bind(this))
  },



  pull: function (data, flowData) {
    // console.log('scrapper | pull : ', data.specificData.url, data.specificData.chemin, data.specificData.url_data, data.specificData.data, data.specificData.flow_before, data.specificData.fix_url);
    return this.makeRequest(flowData, data.specificData.url, data.specificData.flow_before, data.specificData.fix_url, data.specificData.scrappe);
  }
}