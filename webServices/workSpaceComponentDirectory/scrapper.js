module.exports = {
    type: 'Scrapper ',
    description: 'Scrapper page html',
    editor: 'scrapper-editor',
    scraperjs: require('scraperjs'),
    sift: require('sift'),
    ////function qui permet de netoyyer le tableau de fin//////
    contains: function (a) {
        var i = a.length;
        while (i--) {
            if (a[i - 1] != null) {
                if (a[i].url == a[i - 1].url) {
                    a.splice(i, 1)
                }
            }
        }
    },
    ////requete principale//////
    makeRequest: function (flowData, url, flow_before, fix_url, scrappes) {
        // console.log("flowData |", flowData, "attribut |", scrappes, "url |", "flow_before |", flow_before, "fix_url |", fix_url)
        //nous permet de recuperer le contexte a tout moment
        var _self = this;
        var finaltab = []
        var tablePromise = []
        var idControleUrlTraitement = 0
        var scraperjsRouter = new this.scraperjs.Router({
            firstMatch: true
        });

        //description du comportement du router de scrapperjs 
        scraperjsRouter
        .on("http*")
        .get()
        .createStatic()
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
            });
            return d
        }).then(function (last, utils) {
            return last;
        }, function (error) {
            console.log(error)
        })

        ///début algo pour le cas ou on a pas de flux entrant////

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
                    scraperjsRouter.route(url, function (found, returned) {
                        if (found && returned) {
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
            ///début algo pour le cas ou on a un  flux entrant////
            console.log('////////IN FLUX BEFORE CASE////////////');
            var urls = flowData[0].data
            var d = null
            var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b/g;
            return new Promise(function (resolve, reject) {
                urls.forEach(function (url) {
                    var id = 0
                    var c = {}
                    return scraperjsRouter.route(url, function (found, returned) {
                        idControleUrlTraitement++
                        // console.log("found |", found, "returned |", returned)
                        if (found && returned) {
                            returned.forEach(function (elements) {
                                elements.forEach(function (element) {
                                    // console.log(element)
                                    var relative_link = element.value.split("")
                                    if (relative_link.indexOf("#") == -1) {
                                        if ((element.value.match(regex) == null) && (element.type != "text")) {
                                            var newElement = element.value.replace(/(\r\n|\n|\r)/gm, "")
                                            // console.log(url.match(regex)[0].concat(newElement))
                                            c[id] = url.match(regex)[0].concat(newElement)
                                            finaltab.push({
                                                "url": url,
                                                "data": c
                                            })
                                            id++
                                        } else {
                                            var newElement = element.value.replace(/(\r\n|\n|\r)/gm, "")
                                            newElement.replace(/\s+/g, ' ').trim();
                                            // console.log(newElement.replace(/\s+/g, ' ').trim())
                                            c[id] = newElement.replace(/\s+/g, ' ').trim()
                                            finaltab.push({
                                                "url": url,
                                                "data": c
                                            })
                                            id++
                                        }
                                    }
                                })
                            })
                        }
                        if (urls.length == idControleUrlTraitement) {
                            _self.contains(finaltab)
                            resolve({
                                data: finaltab
                            })
                        }
                    })
                })
            })
        }
    },

    test: function (data, flowData) {
        // console.log('scrapper | test : ', data.specificData.url, data.specificData.chemin, data.specificData.url_data, data.specificData.data, data.specificData.flow_before, data.specificData.fix_url);
        return this.makeRequest(flowData, data.specificData.url, data.specificData.flow_before, data.specificData.fix_url, data.specificData.scrappe);
    }
}