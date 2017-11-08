"use strict";
module.exports = {
  componentLib: require('./lib/core/lib/workspace_component_lib.js'),
  jwt: require('jwt-simple'),
  moment: require('moment'),
  config: require('./configuration'),
  httpGet: require('./webServices/workSpaceComponentDirectory/restGetJson.js'),
  http: require('http'),
  runTimers: function(dedicaded) {
    if (dedicaded) {
      const payload = {
        exp: this.moment().add(14, 'days').unix(),
        iat: this.moment().unix(),
        iss: 'timerScheduler'
      }
      var token = this.jwt.encode(payload, this.config.secret);

      this.componentLib.get_all({
        module: 'timer'
      }).then(components => {
        console.log(components.length + ' timers');
        components.forEach(c => {

          let now = new Date();
          let lastExec = c.specificData.last == undefined ? undefined : new Date(c.specificData.last);
          if (c.specificData.interval != undefined) {
            let interval = c.specificData.interval;
            console.log(now - (interval * 1000 * 60), lastExec);
            if (lastExec == undefined || (interval != undefined && now - (interval * 1000 * 60) >= lastExec)) {
              c.specificData.last = now;
              //console.log(c);
              this.componentLib.update(c);
              //this.http.globalAgent.maxSockets = 5000;
              let keepAliveAgent = new this.http.Agent({
                keepAlive: true
              });
              this.http.get({
                host: 'localhost',
                port: '8080',
                path: '/data/core//workspaceComponent/' + c._id + '/work',
                headers: {
                  "Authorization": "JTW" + " " + token
                },
                agent: keepAliveAgent
              }, function(res) {
                if (res.statusCode == 200) {

                }
                res.on('end', () => {
                  console.log('END Timer Work');
                });
              }.bind(this)).on('error', (e) => {
                console.error('timer work request fail', e);
                //throw new Error(e)
              });
            }
          }



          // this.httpGet.makeRequest('GET', workUrl,undefined,{headers:{"Authorization": "JTW" + " " + token}}).then(result => {
          // }).then(function(data) {
          //   console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
          //   //res.json(data.data);
          // }).catch(e => {
          //   console.log('Timer Service Run Error', e);
          //   //next(e);
          // });

          //var recursivPullResolvePromiseDynamic = require('./webServices/recursivPullResolvePromise');
          // recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(c, 'work').then(function(data) {
          //   console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
          //   //res.json(data.data);
          // }).catch(e => {
          //   console.log('Timer Service Run Error', e.displayMessage);
          //   //next(e);
          // });
        })
      })
    }
  },
  run: function(dedicaded) {
    //this.address = address;
    this.runTimers(dedicaded);
    setInterval(this.runTimers.bind(this, dedicaded), 60000);
  }
}
