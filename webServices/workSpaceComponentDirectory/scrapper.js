module.exports = {
    type: 'Scrapper ',
    description: 'Scrapper page html',
    editor: 'scrapper-editor',
    scraperjs: require('scraperjs'),
    makeRequest: function (url, chemin) {
        // console.log("chemin |", chemin, "url ", url)
        // console.log("STARTING PARSE")
        var finaltab = []
        var router = new this.scraperjs.Router({
            firstMatch: true
        });
        console.log(router)
        router
            .on("https://*")
            .get()
            .createStatic()
            // if the status code is different from OK (200) we stop
            .onStatusCode(function (statusCode, utils) {
                if (statusCode !== 200) {
                    utils.stop();
                    res.send({
                        error: "in page error"
                    })
                } else {
                    console.log("in page")
                }
            })
            .scrape(function ($) {
                return $(chemin).map(function () {
                    return $(this).text();
                }).get();
            })
            .then(function (last, utils) {
                console.log("in last")
                // console.log(last)
                return last;
            });


        router.otherwise(function (url) {
            unknownRoutes.push(url);
        });

        return new Promise(function (resolve, reject) {
            console.log("in table push |", url)
            var id = 0
            router.route(url, function (found, returned) {
                console.log("in router push |", url)
                if (found && returned) {
                    returned.forEach(function(element) {
                        // console.log()
                        // element.replace(/(\r\n|\n|\r)/gm, "<br>");
                        var c = {}
                        var newElement = element.replace(/(\r\n|\n|\r)/gm, "")
                        c[id] = newElement.replace(/\s+/g,' ').trim()
                        finaltab.push(c)
                        id ++
                    })

                    if(finaltab.length == returned.length){
                        resolve({
                            data: finaltab
                        })
                    }
                }
            }, function (err) {
                if (err) {
                    resolve({
                        data: 'ERROR'
                    })
                }
            })
        })

    },

    test: function (data) {
        console.log('scrapper | test : ', data.specificData.url, data.specificData.chemin);
        return this.makeRequest(data.specificData.url, data.specificData.chemin);
    }
}
