var userModel = require('../../../lib/core/models').user
var child_process = require("child_process");
var proc = child_process.exec('wdio test/wdio.conf.local.js',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        userModel.remove({
            'credentials.email': "alexfoot9@orange.fr"
        })
        .exec(function (err, userData) {
            console.log("user delete");
            proc.kill('SIGINT');//try to kill process after async but fail
        });
        if (error !== null) {
          console.log('exec error: ' + error);
        };

}.bind(this));
