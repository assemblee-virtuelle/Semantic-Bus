var https = require('https');
var http = require('http');


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = function (router) {

  router.get('/testLdp/', function (req, res) {
    var source = "http://testldp-simonzen.rhcloud.com/ldp/initiative";
    var bodyChunks;
    var ldpReq = http.get(source, function (httpsReturn) {
      httpsReturn.on('data', (chunk) => {
        //console.log(chunk);
        bodyChunks = JSON.parse(chunk);

      });
      httpsReturn.on('end', function () {
        var compileData = [];
        for (source of bodyChunks['@graph']) {
          for (initiative of source['http://www.w3.org/ns/ldp#contains']) {
            compileData = compileData.concat({
              name: initiative['@id']
            });
          }
        }
        //console.log(compileData)
        res.json(compileData);
      });
    });
    ldpReq.end();
  }); //<= testLdp

}