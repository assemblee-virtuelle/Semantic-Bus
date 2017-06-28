module.exports = {
    type: 'Scrapper ',
    description: 'Scrapper page html',
    editor: 'scrapper-editor',
    scraperjs: require('scraperjs'),
    sift: require('sift'),
    makeRequest: function (flowData, url, flow_before, fix_url, scrappes) {
        // console.log("flowData |", flowData, "attribut |", scrappes, "url |", "flow_before |", flow_before, "fix_url |", fix_url)
        console.log("STARTING PARSE")
        var finaltab = []
        var tablePromise = []
        var router = new this.scraperjs.Router({
            firstMatch: true
        });
        var idControleUrlTraitement = 0
        router
            .on("https://*" || "https://*")
            .get()
            .createStatic()
            // if the status code is different from OK (200) we stop
            .onStatusCode(function (statusCode, utils) {
                if (statusCode !== 200) {
                    utils.stop();
                    console.log("in page ERROR")
                    return "in page error"
                } else {
                    console.log("in page")
                }
            })
            .scrape(function ($) {
                var d = []
                console.log("in middle")
                scrappes.forEach(function (scrappeAttribute) {
                    type = scrappeAttribute.attribut
                    console.log("MIDDLE TYPE", type)
                    // console.log("scrappeAttributefield |", scrappeAttribute.field, "scrappeAttributeAttribut |", scrappeAttribute.attribut); 
                    d.push($(scrappeAttribute.field).map(function () {
                        if (scrappeAttribute.attribut == "text") {
                            return {
                                type: scrappeAttribute.attribut,
                                value: eval("$(this)." + scrappeAttribute.attribut + "()")
                            }
                        } else {
                            return {
                                type: scrappeAttribute.attribut,
                                value: eval("(this)." + scrappeAttribute.attribut)
                            }
                        }
                    }).get())
                    console.log(d)
                });
                return d
            }).then(function (last, utils) {
                // console.log(last)
                return last;
            }, function (error) {
                console.log(error)
            })


        if (flowData == null) {
            console.log('////////IN  ONE URL CASE////////////');
            return new Promise(function (resolve, reject) {
                if (flow_before == true) {
                    resolve({
                        data: "Vous n'avez pas de flux précedent"
                    })
                } else {
                    var id = 0
                    var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b/g;
                    console.log("in table push |", url)
                    router.route(url, function (found, returned) {
                        if (found && returned) {
                            console.log("///// RETOUR //////")
                            returned.forEach(function (elements) {
                                elements.forEach(function (element) {
                                    // console.log(element)
                                    var relative_link = element.value.split("")
                                    if (relative_link.indexOf("#") == -1) {
                                        // console.log("type", type)
                                        if ((element.value.match(regex) == null && element.type == "attribs.href")) {
                                            // console.log(" point", element)
                                            var newElement = element.value.replace(/(\r\n|\n|\r)/gm, "")
                                            finaltab.push(url.match(regex)[0].concat(newElement))
                                        } else {
                                            // console.log("no Point" ,element)
                                            var newElement = element.value.replace(/(\r\n|\n|\r)/gm, "")
                                            // c[id] = 
                                            finaltab.push(newElement.replace(/\s+/g, ' ').trim())
                                        }
                                        id++
                                        resolve({
                                            data: finaltab
                                        })
                                    }
                                })
                            })
                        } else {
                            resolve({
                                data: "Aucune data"
                            })
                        }
                    }, function (err) {
                        if (err) {
                            return
                        }
                    })
                }
            })
        } else {
            console.log('////////IN FLUX BEFORE CASE////////////');
            var urls = flowData[0].data
            var d = null
            var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b/g;
            console.log("SIZE", flowData[0].data.length)
            return new Promise(function (resolve, reject) {
                urls.forEach(function (url) {
                    var id = 0
                    var c = {}
                    var d = {}
                    d[url] = c
                    var count = 0
                    return router.route(url, function (found, returned) {
                        idControleUrlTraitement++
                        // console.log("found |", found, "returned |", returned)
                        if (found && returned) {
                            returned.forEach(function (elements) {
                                elements.forEach(function (element) {
                                    // console.log(element)
                                    var relative_link = element.value.split("")
                                    if (relative_link.indexOf("#") == -1) {
                                        if ((element.value.match(regex) == null) && (element.type != "text")) {
                                            // console.log(" no Point", element)
                                            var newElement = element.value.replace(/(\r\n|\n|\r)/gm, "")
                                            // console.log(url.match(regex)[0].concat(newElement))
                                            c[id] = url.match(regex)[0].concat(newElement)
                                            finaltab.push({
                                                "url": url,
                                                "data": c
                                            })
                                            id++
                                        } else {
                                            // console.log("point" ,element)
                                            var newElement = element.value.replace(/(\r\n|\n|\r)/gm, "")
                                            newElement.replace(/\s+/g, ' ').trim();
                                            // console.log(newElement.replace(/\s+/g, ' ').trim())
                                            c[id] = newElement.replace(/\s+/g, ' ').trim()
                                            finaltab.push({
                                                "url": url,
                                                "data": c
                                            })
                                            // console.log(Object.keys(d))
                                            id++
                                        }
                                    }
                                })
                            })
                        }
                        if (urls.length == idControleUrlTraitement) {
                            resolve({
                                data: finaltab
                            })
                        }
                    }.bind(this))
                }.bind(this))
            })
        }
    },

    test: function (data, flowData) {
        // console.log('scrapper | test : ', data.specificData.url, data.specificData.chemin, data.specificData.url_data, data.specificData.data, data.specificData.flow_before, data.specificData.fix_url);
        return this.makeRequest(flowData, data.specificData.url, data.specificData.flow_before, data.specificData.fix_url, data.specificData.scrappe);
    }
}