"use strict";
var http = require('http');
var cluster = require('cluster');
var stopSignals = [
  'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
  'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
];
var production = process.env.NODE_ENV == 'production';
var jenkins = process.env.JENKINS_DEPLOY || false;

let stopping = false;

cluster.on('disconnect', function (worker) {
  if (production) {
    if (!stopping) {
      cluster.fork();
    }
  } else {
    process.exit(1);
  }
});

if (cluster.isMaster) {
  var workerCount = process.env.NODE_CLUSTER_WORKERS || 4;
  console.log(`Starting ${workerCount} workers...`);
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }
  if (production) {
    stopSignals.forEach(function (signal) {
      process.on(signal, function () {
        console.log(`Got ${signal}, stopping workers...`);
        stopping = true;
        cluster.disconnect(function () {
          console.log('All workers stopped, exiting.');
          process.exit(0);
        });
      });
    });
  }
  if (jenkins) {
      console.log("jenkins is true", data);
      http.get('http://bkz2jalw7c:3bdcf7bc40f582a4ae7ff52f77e90b24@tvcntysyea-jenkins.services.clever-cloud.com:4003/job/semanticbus-pic-3/build?token=semantic_bus_token', function (res) {
        console.log("jenkins JOB 3 is trigger")
      })
  }
} else {
  require('./app.js');
}

