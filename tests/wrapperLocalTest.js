var userModel = require('../core/models').user
var child_process = require("child_process");
var proc = child_process.exec('wdio test/wdio.conf.local.js',
  function(error, stdout, stderr) {
    //console.log('stdout: ' + stdout);
    //console.log('stderr: ' + stderr);


    userModel.remove({
        'credentials.email': "alextesteur2@orange.fr"
      })
      .exec(function(err, userData) {
        //console.log("user delete");
        //proc.kill('SIGINT');//try to kill process after async but fail
        if (error !== null) {
          //console.log('exec error: ' + error);
          process.exit(1);
        } else {
          process.exit(0);
        }
      });


  }.bind(this));

// var asyncProcess = child_process.spawn('wdio', ['test/wdio.conf.local.js']);
//
// asyncProcess.stdout.on('data', function (data) {
//   //console.log('stdout: ' + data.toString());
// });
//
// asyncProcess.stderr.on('data', function (data) {
//   //console.log('stderr: ' + data.toString());
// });
//
// asyncProcess.on('exit', function (code) {
//   //console.log('child process exited with code ' + code.toString());
//   process.exit(code);
// });
