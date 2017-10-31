"use strict";
module.exports = {
  componentLib: require('./lib/core/lib/workspace_component_lib.js'),
  runTimers: function() {
    this.componentLib.get_all({
      module: 'timer'
    }).then(components => {
      console.log(components.length + ' timers');
      components.forEach(c => {
        //let workUrl=('http://'+this.adress.address+':'this.adress.port+'/data/core/')
        console.log(c._id, c.specificData.interval, this.adress);
        var recursivPullResolvePromiseDynamic = require('./webServices/recursivPullResolvePromise');
        recursivPullResolvePromiseDynamic.getNewInstance().resolveComponent(c, 'work').then(function(data) {
          console.log("IN WORKSPACE COMPONENT RETURN DATA |", data)
          //res.json(data.data);
        }).catch(e => {
          console.log('Timer Service Run Error', e.displayMessage);
          //next(e);
        });
      })
    })
  },
  run: function(adress) {
    this.adress = adress;
    this.runTimers();
    setInterval(this.runTimers.bind(this), 60000);
  }
}
