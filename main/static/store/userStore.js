console.log("contructeur UserStore");
var UserStore = function() {
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
      if (data != null && data.token != null) {
        console.log("in application ajax triger");
        localStorage.token = data.token
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login',"/connexion");
        }.bind(this))
      } else if(data.err == "google_user") {
        this.trigger('google_user')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login',"/connexion");
        }.bind(this))
      }else if(data.err == "no_account_found") {
          console.log("no_account_found");
          this.trigger('bad_auth')
          this.sleep(2000).then(function () {
            this.trigger('ajax_receipt_login',"/connexion");
          }.bind(this))
      }
      else if(data.err == "probleme_procesus") {
        console.log("probleme_procesus");
        this.trigger('err_processus')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login',"/connexion");
        }.bind(this))
    }
    });
  });

  this.on('google_connect', function (token) {
    var token = {
      token: token
    }
    $.ajax({
      method: 'post',
      data: JSON.stringify(token),
      contentType: 'application/json',
      url: '/auth/google_auth_statefull_verification',
      beforeSend: function () {
        this.trigger('ajax_send_login');
      }.bind(this),
    }).done(data => {
      console.log("----- google data -----", data)
      if (data != null && data.token != null) {
        localStorage.token = data.token
        console.log("----- token data -----", localStorage.token)
        this.trigger('application_redirect')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/connexion");
        }.bind(this))
      } else {
        this.trigger('bad_auth')
        this.trigger('ajax_receipt_login', "/connexion");
      }
    });
  });




  this.on('is_authorize', function (data) {
    console.log("is_authorize", data)
    if(data.length > 1){
      $.ajax({
        method: 'post',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/auth/is_authorize_component',
      }).done(data => {
        console.log("isScrennAuthorize", data)
        if(data.state == "authorize"){
          this.trigger('is_authorize_true')
        }else{
          this.trigger('is_authorize_false')
        }
      })
    }else{
        this.trigger('is_authorize_false')
    }
  })

  this.on('forgot_password', function (email) {
    console.log(email)
    $.ajax({
      method: 'get',
      contentType: 'application/json',
      url: '/auth/passwordforget/' + email,
    }).done(data => {
      console.log("mail sent", data)
      if(data.state == "mail_sent"){
        this.trigger('enter_code', data.user)
      }else{
        this.trigger('error_send_mail_code')
      }
    })
  })


  this.on('verife_code', function (data) {
    console.log("verifecode", data)
    if(data.user._id){
      $.ajax({
        method: 'get',
        contentType: 'application/json',
        url: '/auth/verifycode/' + data.user._id + '/' + data.code,
      }).done(data => {
        console.log("verif code done", data)
        if(data.state == "good_code"){
          this.trigger('good_code', data.user)
        }else if(data.state == "bad_code"){
          this.trigger('error_change_code')
        }else{
          this.trigger('token_expired')
        }
      })
    }else{
      this.trigger('back_send_mail')
    }
  })


  this.on('update_password', function (data) {
    console.log("update_password", JSON.stringify(data))
    $.ajax({
      method: 'post',
      contentType: 'application/json',
      data: JSON.stringify(data),
      url: '/auth/updatepassword',
    }).done(data => {
      console.log("update_password", data)
      if(data.state == "password_update"){
        this.trigger('password_update')
      }else if(data.state == "token_expired"){
        this.trigger('token_expired')
      }else if(data.state == "no_user"){
        this.trigger('back_send_mail')
      }else{
        this.trigger('password_update_error')
      }
    })
  })



  this.on('user_inscription', function (user) {
    console.log(user);
    $.ajax({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/auth/inscription',
      beforeSend: function () {
        //console.log("before send")
        this.trigger('ajax_send_login');
      }.bind(this),
    }).done(data => {
      console.log(data.err);
      console.log('XXXXXXXXXXXXXx',data);
      if (data != null && data.token != null) {
        localStorage.token = data.token
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/inscription");
        }.bind(this))
      } else if(data.err == 'google_user') {
        this.trigger('google_user')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/inscription");
        }.bind(this))
      }else if (data.err == "user_exist"){
        console.log("IN IF USER EXIST")
        this.trigger('email_already_exist')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/inscription");
        }.bind(this))
      }
      else if (data.err == "name_bad_format"){
        this.trigger('name_bad_format')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/inscription");
        }.bind(this))
      }
      else if (data.err == "job_bad_format"){
        this.trigger('job_bad_format')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/inscription");
        }.bind(this))
      }
      else if (data.err == "bad_email"){
        this.trigger('bad_email')
        this.sleep(2000).then(function () {
          this.trigger('ajax_receipt_login', "/inscription");
        }.bind(this))
      }
    });
  });

  this.on('google_user_connect', function () {
    $.ajax({
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      beforeSend: function () {
        this.trigger('ajax_send_login');
      }.bind(this),
      contentType: 'text/html',
      url: '/auth/google'
    }).done(data => {
      sleep(2000).then(function () {
        this.trigger('ajax_receipt_login', "/connexion");
      }.bind(this))
      // if(data != null && data.token != null){
      //   localStorage.token = data.token
      //   window.open("../ihm/application.html", "_self");
      // }else{
      //   this.trigger('email_already_exist')
      // }
    });
  });
}
