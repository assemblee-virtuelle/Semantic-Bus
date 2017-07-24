function UserStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.userCurrrent;

  this.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  this.on('https_force?', function () {
  console.log("https_force")
    $.ajax({
      method: 'get',
      url: '/configuration/configurationhttps',
      }).done(data => {
        if(data == "force"){
          if(window.location.href.substr(0, 5) != "https"){
            console.log(window.location.href)
            window.location.replace("https" + window.location.href.substr(4, window.location.href.split("").length -1))
            // window.location.replace("https" + window.location.href.substr(5, window.location.href.split("").length -1))
          }
        }
        return data
      })
  })

  this.on('user_connect', function (user) {
    console.log(user)
    $.ajax({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/auth/authenticate',
      beforeSend: function () {
        console.log("before send")
        this.trigger('ajax_send_login');
      }.bind(this),
    }).done(data => {
      console.log(data)
      if (data == false) {
        this.trigger('google_auth')
      } else if (data.user != null && data.token != null) {
        console.log("in application ajax triger");
        localStorage.token = data.token
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
        this.spleep(2000).then(function () {
          this.trigger('ajax_receipt_login');
        }.bind(this))

      } else {
        console.log("data no");
        this.trigger('bad_auth')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login');
        }.bind(this))
      }
    });
  });

  this.on('google_connect', function (token) {
    var token = {
      token: token
    }
    console.log(token)
    $.ajax({
      method: 'post',
      data: JSON.stringify(token),
      contentType: 'application/json',
      url: '/auth/authenticate',
      beforeSend: function () {
        console.log("before send")
        this.trigger('ajax_send_login');
      }.bind(this),
    }).done(data => {
      console.log(data)
      if (data.user != null && data.token != null) {
        localStorage.token = data.token
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login');
        }.bind(this))
      } else {
        console.log("data no");
        this.trigger('bad_auth')
      }
    });
  });





  this.on('user_inscription', function (user) {
    // console.log(user);
    $.ajax({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/auth/inscription',
      beforeSend: function () {
        console.log("before send")
        this.trigger('ajax_send_login');
      }.bind(this),
    }).done(data => {
      console.log(data);
      if (data.user != null && data.token != null) {
        localStorage.token = data.token
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login');
        }.bind(this))
      } else {
        this.trigger('email_already_exist')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login');
        }.bind(this))
      }
    });
  });

  this.on('google_user_connect', function () {
    console.log('google_user_connect');
    $.ajax({
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      beforeSend: function () {
        console.log("before send")
        this.trigger('ajax_send_login');
      }.bind(this),
      contentType: 'text/html',
      url: '/auth/google'
    }).done(data => {
      console.log(data);
      sleep(2000).then(function () {
        this.trigger('ajax_receipt_login');
      }.bind(this))
      // if(data.user != null && data.token != null){
      //   localStorage.token = data.token
      //   window.open("../ihm/application.html", "_self");
      // }else{
      //   this.trigger('email_already_exist')
      // }
    });
  });
}