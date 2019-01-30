"use strict";
module.exports = {
  componentLib: require('./lib/workspace_component_lib.js'),
  jwt: require('jwt-simple'),
  moment: require('moment'),
  http: require('http'),
  url: require('url'),
  config: require('../main/configuration.js'),
  runTimers: function(dedicaded) {
    // console.log('----- Timer Cron')
    this.componentLib.get_all_withConsomation({
      module: 'timer'
    }).then(components => {
      // console.log('components',components.length);
      if ((dedicaded && this.config.timer != undefined) || (dedicaded==undefined && this.config.timer == undefined)) {
        // console.log('conditions');
        //console.log(components.length + ' timers');
        components.forEach(c => {
          let now = new Date();
          let lastExec = c.specificData.last == undefined ? undefined : new Date(c.specificData.last);
          // console.log('lastExec',lastExec);
          if (c.specificData.interval != undefined) {
            let interval = c.specificData.interval;
            // console.log('interval',now - (interval * 1000 * 60), lastExec);
            if (lastExec == undefined || (interval != undefined && now - (interval * 1000 * 60) >= lastExec)) {
              // console.log('GO!');
              c.specificData.last = now;
              this.componentLib.update(c);

              if (dedicaded && this.config.timer != undefined) {
                console.log('Timer dedidated!');

                const payload = {
                  exp: this.moment().add(14, 'days').unix(),
                  iat: this.moment().unix(),
                  iss: 'timerScheduler'
                }

                const token = this.jwt.encode(payload, this.config.timer.secret);

                //this.http.globalAgent.maxSockets = 5000;
                let keepAliveAgent = new this.http.Agent({
                  keepAlive: true
                });

                const parsedUrl = this.url.parse(this.config.timer.target);
                //console.log('GET',parsedUrl);
                this.http.get({
                  host: parsedUrl.hostname,
                  port: parsedUrl.port,
                  path: '/data/core/work-ask/' + c._id,
                  headers: {
                    "Authorization": "JTW" + " " + token
                  },
                  agent: keepAliveAgent
                }, function(res) {
                  if (res.statusCode == 200) {
                    console.log('GOOD');
                  }
                  res.on('end', () => {
                    console.log('END Timer Work');
                  });
                }.bind(this)).on('error', (e) => {
                  console.error('timer work request fail', e);
                  //throw new Error(e)
                });

              } else if (dedicaded==undefined && this.config.timer == undefined) {
                console.log('GO not dedidated!');
                let engine = require('../../webServices/recursivPullResolvePromise');
                engine.getNewInstance().resolveComponent(c, 'work').then(() => {
                  //console.log('timer done');
                })
              }
            }
          }
        });
      }
    })
  },
  run: function(dedicaded) {
    //this.address = address;
    this.runTimers(dedicaded);
    setInterval(this.runTimers.bind(this, dedicaded), 60000);
  }
}
