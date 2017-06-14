module.exports = {
  type: 'Upload',
  description: 'Uploader un fichier',
  editor: 'upload-editor',
  formidable: require('formidable'),
  mLabPromise: require('../mLabPromise'),
  stepNode: true,
  
  //recursivPullResolvePromise : require('../recursivPullResolvePromise'),
  initialise: function(router,recursivPullResolvePromise) {
    this.recursivPullResolvePromise = recursivPullResolvePromise;
    router.post('/specific/upload/:compId', function(req, res) {
      var compId = req.params.compId;
      var fs = require('fs');
      var csv = require('csvtojson');
      var xlsx = require('xlsx');
      var regex = /\.([^.]+)/g;
      var reg = new RegExp(regex, 'g');
      var form = new this.formidable.IncomingForm();
      var responseBody = '';
      var finaltab = [];
      var mLabPromise =  require('../mLabPromise');
     
      form.on('file', function(field, file) {
        ///readstream
        var formData = {
          Lastfile: {
            value:  fs.createReadStream(file.path),
            options: {
              filename: file.name
            }
          }
        };
        // console.log("in on");
        if(formData.Lastfile.options.filename){
          formData.Lastfile.value.on('data', function (chunk) {
             responseBody += chunk.toString();
              console.log(responseBody)
          })
          //regex 
          // console.log(file.name)
          var ext = formData.Lastfile.options.filename.match(regex);
          console.log(ext);
          // console.log(ext[ext.length - 1]);
          if(ext[ext.length - 1] == ".csv"){
            formData.Lastfile.value.on('end',() => {
              // csv traitement
              csv({noheader: true}).fromString(responseBody)
                .on('json', (jsonObj) => {
                  // console.log('CSV', jsonObj)
              }).on('end_parsed', (jsonArray) => {
                console.log("jsonArray")
                return new Promise((resolve, reject) => {
                  console.log("from mlab");
                  mLabPromise.request('PUT', 'cache/' + compId, {
                  data: jsonArray
                }).then(function(data) {
                    console.log('cache | test| ',data);
                    resolve(data);
                    //return recursivPullResolvePromise.resolveComponentPull(data);
                  })
                });
              })
            })
          }else if (ext[ext.length - 1] == ".xlsx"){
            //    // xls traitment
            //    console.log("xlsx traitment")
               
            //    var final_data = [];
            //    formData.Lastfile.value.on('end',() => {
              
            //    var workbook = xlsx.read(responseBody, {type: 'buffer'});
            //    console.log(workbook.Sheets.Sheet1)
            //    for (var property in workbook.Sheets) {
            //       console.log(xlsx.utils.sheet_to_json(workbook.Sheets[property], {header:1, raw:"true"}));
            //       final_data.push(workbook.Sheets[property]);
            //       console.log(workbook.Sheets[property])
            //     }
            //     // console.log(final_data);
            //     return new Promise((resolve, reject) => {
            //       console.log("from mlab");
            //       mLabPromise.request('PUT', 'cache/' + compId, {
            //       data: final_data
            //     }).then(function(data) {
            //         // console.log('cache | test| ',final_data);
            //         resolve(final_data);
            //       })
            //     });
            // })
          }
        }
      })
      
      form.parse(req)
    }.bind(this));
  },

  test: function(data, flowData) {
    //console.log('Flow Agregator | test : ',data,' | ',flowData);
    return new Promise((resolve, reject) => {
        this.mLabPromise.request('GET', 'cache/' + data._id.$oid).then(function(cachedData) {
          resolve({data:cachedData.data});
        });
    })
  }
}

