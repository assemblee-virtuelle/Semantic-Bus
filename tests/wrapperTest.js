var userModel = require('../core/models/user_model')
var exec = require("child_process").exec;
// var mLabPromise = require('../webServices/mLabPromise')
// mLabPromise.cloneDatabaseMigration().then(data => {
//     exec('wdio test/wdio.conf.cloud.fonctionels.js',
//     function (error, stdout, stderr) {
//       //console.log('stdout: ' + stdout);
//       //console.log('stderr: ' + stderr);
//       if (error !== null) {
//         //console.log('exec error: ' + error);
//         process.exit(0);//no break build if test faild on jenkins
//       } else {
//         process.exit(0);
//       }
//     }.bind(this));
// })

// //console.log("in test")
