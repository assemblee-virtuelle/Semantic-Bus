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
              // xls traitment
              console.log("xlsx traitment")
              var final_data = [];
              formData.Lastfile.value.on('end',() => {
               var workbook = xlsx.read(responseBody, {type:'buffer'});
               console.log(workbook);
              //  final_data.push(workbook)
              
               
              //  console.log(test);
              //  var test = { SheetNames: [ 'Sheet1' ],
              //     Sheets: { Sheet1: { A1: [Object], B1: [Object], '!ref': 'A1:B1' } } }
                for (var property in workbook.Sheets) {  
                  // console.log(xlsx.utils.sheet_to_json(workbook.Sheets[property], {header:1, raw:"true"}));
                  final_data.push(workbook.Sheets[property]);
                  // console.log(workbook.Sheets[property])
                }
              //  workbook.SheetNames.forEach(function(sheetName){
              //                // Here is your object
                
              //   var XL_row_object = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
              //   var json_object = JSON.stringify(XL_row_object);
                console.log(final_data);
              // })
              
              //  console.log(formData.Lastfile.value)

              // var ws = wb.Sheets[wb.SheetNames[0]]
              //  console.log(JSON.stringify(wb.Sheets.join("\n")));
              //  console.log(ws)
              //  console.log(xlsx.utils.sheet_to_json(ws));
              //  for (var property in wb.Sheets) {
              //   // if (object.hasOwnProperty(property)) {
              //      // do stuff
              //      console.log(wb.Sheets[property]);
              //     //  final_data.push(wb.Sheets[property]);
              //     //  console.log(final_data);
              //   // }
              // }
              // console.log(final_data);
              return new Promise((resolve, reject) => {
                  console.log("from mlab");
                  mLabPromise.request('PUT', 'cache/' + compId, {
                  data: final_data
                }).then(function(data) {
                    // console.log('cache | test| ',final_data);
                    resolve(final_data);
                    //return recursivPullResolvePromise.resolveComponentPull(data);
                  })
                });
            })
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
          //console.log('cache | test| ',data);
          //return recursivPullResolvePromise.resolveComponentPull(data);
        });
    })
  }
}




        // this.recursivPullResolvePromise.resolveComponentPull(data, false).then(data => {
        //   console.log('CACHE LOADED');
        // })
        // res.json({
        //   message: 'in progress'
        // });
    //      return new Promise((resolve, reject) => {
    //   if (flowData != undefined) {
    //     //console.log('cash data | ',flowData);
    //     this.mLabPromise.request('PUT', 'cache/' + data._id.$oid, {
    //       data: flowData[0].data
    //     }).then(function(data) {
    //       resolve(data);
    //       //console.log('cache | test| ',data);
    //       //return recursivPullResolvePromise.resolveComponentPull(data);
    //     });
    //   }