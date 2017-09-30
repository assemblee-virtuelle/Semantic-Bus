var mLabPromise = require('../../../webServices/mLabPromise.js');
var exec = require("child_process").exec;

mLabPromise.cloneDatabaseMigration().then(data => {
    exec('wdio test/wdio.conf.cloud.fonctionels.js',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    }.bind(this));
})
