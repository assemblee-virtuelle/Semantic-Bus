function AdminStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.menu = 'errors'
  this.on('clone_database', function(data) {
    console.log('clone');
    $.ajax({
      method: 'get',
      url: '../data/core/cloneDatabase',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function(data) {
      //console.log('store load', data);
      //this.workspaceCollection = data;
      //if (callback != undefined) {
      //  callback();
      //}
      this.trigger('dataBase_cloned', data);

    }.bind(this));
  });

  this.on('dbScript_load', function(data) {
    utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/dbScripts'
    }, true).then(data => {
      //console.log(data);
      this.trigger('dbScript_loaded', data);
    }).catch(error => {
      console.log(error);
    });
  });

  this.on('execute_script', function(scripts) {
    utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/dbScripts',
      data : JSON.stringify(scripts)
    }, true).then(data => {
      console.log(data);
    }).catch(error => {
      console.log(error);
    });
  });

  this.on('error_load', function(data) {
    console.log('ERRORS LOAD');
    $.ajax({
      method: 'get',
      url: '../data/core/errors',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json',
    }).done(function(data) {
      this.trigger('error_loaded', data);
    }.bind(this));
  });
  this.on('navigation', function(entity, id, action) {
    if (entity == "admin") {
      this.menu = action;
      this.trigger('navigation_control_done', entity, action);
      this.trigger('admin_menu_changed', this.menu);
    }
  });

}
