"use strict";
module.exports = {
  componentLib: require('./lib/workspace_component_lib.js'),
  jwt: require('jwt-simple'),
  moment: require('moment'),
  http: require('http'),
  url: require('url'),
  request : require('request'),
  config: require("../timer/configuration"),
  runTimers: function(dedicaded) {
    // console.log('----- Timer Cron')
    this.componentLib.get_all_withConsomation({
      module: 'timer'
    }).then(components => {
        components.forEach(c => {
          let now = new Date();
          let nextExec = c.specificData.next == undefined ? undefined : new Date(c.specificData.next);
          // console.log('lastExec',lastExec);
          if (c.specificData.interval != undefined) {
            let interval = c.specificData.interval;
            // console.log('interval',now - (interval * 1000 * 60), lastExec);
            if (nextExec == undefined || nextExec<now) {
              if (dedicaded) {
                // console.log('Timer dedidated!', c._id,c.workspaceId);

                const payload = {
                  exp: this.moment().add(14, 'days').unix(),
                  iat: this.moment().unix(),
                  iss: 'timerScheduler'
                }

                const token = this.jwt.encode(payload, this.config.secret);

                //this.http.globalAgent.maxSockets = 5000;
                let keepAliveAgent = new this.http.Agent({
                  keepAlive: true
                });


                const parsedUrl = this.url.parse(this.config.engineUrl+'/work-ask/' + c._id);
                // console.log('--- POST --',parsedUrl);
                this.request.post(this.config.engineUrl + '/work-ask/' + c._id, {
                    body: {
                      pushData: undefined,
                      queryParams: undefined
                    },
                    json: true
                  }
                  // eslint-disable-next-line handle-callback-err
                  , (err, data) => {
                    if(err!=undefined){
                      console.error('timer Error',err);
                    }
                  });
                // this.http.request({
                //   host: parsedUrl.hostname,
                //   port: parsedUrl.port,
                //   method:'POST',
                //   // path: '/engine/work-ask/' + c._id,
                //   headers: {
                //     "Authorization": "JTW" + " " + token
                //   },
                //   agent: keepAliveAgent
                // }, (res) => {
                //   if (res.statusCode == 200) {
                //     console.log('GOOD');
                //     res.on('end', () => {
                //       console.log('END Timer Work');
                //     });
                //   }else{
                //     console.error('timer work request fail',parsedUrl.href, res.statusCode);
                //   }
                //
                // }).on('error', (e) => {
                //   console.error('timer work request fail', e);
                //   //throw new Error(e)
                // });

              }
            }
          }
        });
    })
  },
  run: function(dedicaded) {
    //this.address = address;
    this.runTimers(dedicaded);
    setInterval(this.runTimers.bind(this, dedicaded), 10000);
  }
}
