var userModel = require('../../../lib/core/models/user_model')
var exec = require("child_process").exec;
var mLabPromise = require('../../../webServices/mLabPromise')
mLabPromise.cloneDatabaseMigration().then(data => {
    exec('wdio test/wdio.conf.cloud.fonctionnels.js',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    }.bind(this));
})
