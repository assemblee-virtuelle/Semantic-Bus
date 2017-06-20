var mLabPromise = require('../mLabPromise');

module.exports = {

  type: 'Upload',
  description: 'Uploader un fichier',
  editor: 'upload-editor',
  formidable: require('formidable'),
  mLabPromise: require('../mLabPromise'),
  stepNode: true,
  //recursivPullResolvePromise : require('../recursivPullResolvePromise'),
  initialise: function (router, recursivPullResolvePromise) {
    this.recursivPullResolvePromise = recursivPullResolvePromise;
    router.post('/upload/:compId', function (req, res) {
      console.log("CALL")
      var compId = req.params.compId;
      var final_tab = []
      var count_table = []
      var regnumero = /[0-9].*/g
      var regLettre = /.*[a-zA-Z]/g
      var i = 0

      if (req.body.ext == 'exel') {
        new Promise((resolve, reject) => {
          for (var sheets in req.body.data) {
            var cellContent = [];
            for (var sheet in req.body.data[sheets]) {
              var cell = {
                [sheet]: req.body.data[sheets][sheet].v,
                feuille: sheets
              }

              cellContent.push(cell)
            }
            final_tab.push({
              feuille: {
                name: sheets,
                content: cellContent
              }
            })
          }
          resolve(
            final_tab
          )
        }).then(function (feuilles) {
          var result = []
          feuilles.forEach(function (feuille) {
            // console.log(feuille.feuille.name);
            var exel_table_to_json = [];
            var cell = {};
            feuille.feuille.content.forEach(function (content, index) {
              if (content.feuille == feuille.feuille.name) {
                if (feuille.feuille.content[index + 1]) {
                  if (Object.keys(content)[0].match(regnumero) != null && Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero) != null) {
                    // console.log(Object.keys(content)[0].match(regnumero)[0],  Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0])
                    // console.log(parseInt(Object.keys(content)[0].match(regnumero)[0]) <  parseInt(Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0]))
                    if (Object.keys(content)[0].match(regnumero)[0] < Object.keys(feuille.feuille.content[index + 1])[0].match(regnumero)[0]) {
                      var c = {}
                      c[Object.keys(content)[0]] = Object.values(content)[0]
                      Object.assign(cell, c);
                      // console.log(cell)
                      exel_table_to_json.push(cell)
                      cell = {}
                    } else {
                      var c = {}
                      c[Object.keys(content)[0]] = Object.values(content)[0]
                      Object.assign(cell, c);
                    }
                  } else {
                    // console.log("cas unicité 1")
                    // console.log(content)
                    var c = {}
                    c[Object.keys(content)[0]] = Object.values(content)[0]
                    Object.assign(cell, c);
                    exel_table_to_json.push(cell)
                  }
                }
              }
            })
            result.push(exel_table_to_json)
          })
          return new Promise((resolve, reject) => {
            console.log("from mlab");
            mLabPromise.request('PUT', 'cache/' + compId, {
              data: result
            }).then(function (data) {
              console.log('cache | testEXEL| ', data);
              resolve(data);
              res.send(data)
            })
          });
        })
      } else if (req.body.ext == null) {
        console.log(req.body)
        return new Promise((resolve, reject) => {
          console.log("from mlab");
          mLabPromise.request('PUT', 'cache/' + compId, {
            data: req.body
          }).then(function (data) {
            console.log('cache | testJSONLD| ', data);
            resolve(data);
            res.send(data)
          })
        });
      }
    }.bind(this));
  },



  test: function (data, flowData) {
    //console.log('Flow Agregator | test : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
      this.mLabPromise.request('GET', 'cache/' + data._id.$oid).then(function (cachedData) {
        resolve({
          data: cachedData.data
        });
      });
    })
  }
}

