function profilStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.userCurrrent;

  this.setUserCurrent = function (user) {
    this.userCurrrent = user;
    this.trigger('profil_loaded', this.userCurrrent);
  }

  this.on('init_stripe_user', function (data) {
    this.trigger('payment_in_progress')
    console.log("stripe_payment IN STORE", localStorage.user_id, JSON.stringify(data))
    // console.log(localStorage.user_id);
    $.ajax({
      method: 'post',
      url: '../data/core/users/stripe/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      data: JSON.stringify({
        amout: JSON.stringify(data.amout),
        card: JSON.stringify(data)
      }),
      contentType: 'application/json'
    }).done(function (data) {
      console.log("DATA RESULT", data)
      // this.trigger('payment_done')
      if(data == "user_no_validate"){
        this.trigger('user_no_validate')
        this.trigger('payment_done')
      }else if(data == "error"){
        this.trigger('error_payment')
        this.trigger('payment_done')
      }else{
        this.trigger('payment_init_done', data)
      }
      this.setUserCurrent(data);
    }.bind(this));
  })


  this.on('stripe_payment', function (data) {
    this.trigger('payment_in_progress')
    console.log("stripe_payment IN STORE", localStorage.user_id, JSON.stringify(data.amount),JSON.stringify(data.source))    
    console.log(localStorage.user_id);
    $.ajax({
      method: 'post',
      url: '../data/core/users/stripecharge/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      data: JSON.stringify({
        amount: data.amount,
        source: data.source,
        secret: data.secret
      }),
      contentType: 'application/json'
    }).done(function (data) {
      console.log("ON ERROR PAYMENT", data)
      this.trigger('payment_done')
      window.history.pushState("", "", '/ihm/application.html#profil//addcredit');
      if(data == "user_no_validate"){
        this.trigger('user_no_validate')
      }else if(data == "error"){
        this.trigger('error_payment')
      }else{
        this.trigger('payment_good', data.credit)
      }
      this.setUserCurrent(data);
    }.bind(this));
  })

  

  this.on('load_transactions', function () {
    $.ajax({
      method: 'get',
      url: '../data/core/users/transactions/' + localStorage.user_id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      if(data != "error"){
        this.trigger('list_transaction_load', data);
      }else{
        this.trigger('list_transaction_error');
      }
    }.bind(this));
  })

  this.on('load_profil', function (message) {
    //console.log('show_profil', localStorage.user_id);
    if (this.userCurrrent == undefined) {
      // console.log(localStorage.user_id);
      $.ajax({
        method: 'get',
        url: '../data/core/users/' + localStorage.user_id,
        headers: {
          "Authorization": "JTW" + " " + localStorage.token
        },
        contentType: 'application/json'
      }).done(function (data) {
        this.setUserCurrent(data);
        // this.userCurrrent = data;
        // console.log("load profil |", this.userCurrrent);
        // this.trigger('profil_menu_changed', this.menu);
        // this.trigger('profil_loaded', this.userCurrrent);

      }.bind(this));
    } else {
      this.setUserCurrent(this.userCurrrent);
      // this.trigger('profil_menu_changed', this.menu);
      // this.trigger('profil_loaded', this.userCurrrent);

    }
    this.trigger('profil_menu_changed', this.menu);
  })



  this.on('send_back_email', function (data) {
    console.log("IN TRIGGER SEND BACK EMAIL", data)
    $.ajax({
      method: 'get',
      url: '../auth/sendbackmail/' + data.user._id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      if (data == "mail_sent") {
        this.trigger('email_send')
      } else {
        this.trigger('error_email_send')
      }
    }.bind(this))
  });


  this.on('load_all_profil_by_email', function (message) {
    $.ajax({
      method: 'get',
      url: '../data/core/users',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      console.log(data)
      var emails = []
      data.forEach(function (user) {
        if (user.credentials) {
          emails.push(user.credentials.email)
        } else {
          console.log('WARNING user without credention : ', user);
        }
      })
      this.trigger('all_profil_by_email_load', emails)
    }.bind(this));
  })


  this.on('update_user', function (data) {
    console.log('update_user', data);
    console.log(JSON.stringify(data));
    $.ajax({
      method: 'put',
      url: '../data/core/users/' + localStorage.user_id,
      data: JSON.stringify(data),
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function (data) {
      console.log(data)
      if (data.err == "google_user") {
        this.trigger('google_user_update')
      }
      if (data.err == "email_already_use") {
        this.trigger('email_already_use')
      }
      if (data.err == "bad_format_email") {
        this.trigger('bad_format_email')
      }
      if (data.err == "bad_format_job") {
        this.trigger('bad_format_job')
      }
      if (data.err == "bad_format_society") {
        this.trigger('bad_format_society')
      }
      if (data.err == null) {
        this.trigger('update_profil_done', data)
      }
    }.bind(this));
  })
  this.on('navigation', function (entity, id, action) {
    if (entity == "profil") {
      this.menu = action;
      this.trigger('navigation_control_done', entity, action);
    }
  });

  this.on('deconnexion', function (message) {
    localStorage.token = null;
    localStorage.user_id = null;
    window.open("../auth/login.html", "_self");
  }.bind(this))


}