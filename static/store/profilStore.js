function profilStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.userCurrrent;

  this.on('load_profil', function(message) {
    console.log('show_profil', localStorage.user_id);
    if (this.userCurrrent == undefined) {
      // console.log(localStorage.user_id);
      $.ajax({
        method: 'get',
        url: '../data/core/users/' + localStorage.user_id,
        headers: {
          "Authorization": "JTW" + " " + localStorage.token
        },
        contentType: 'application/json'
      }).done(function(data) {
        this.userCurrrent = data
        console.log("load profil |", this.userCurrrent)
        this.trigger('profil_menu_changed', this.menu)
        this.trigger('profil_loaded', this.userCurrrent)

      }.bind(this));
    } else {
      this.trigger('profil_menu_changed', this.menu)
      this.trigger('profil_loaded', this.userCurrrent)

    }
  })


  this.on('load_all_profil_by_email', function(message) {
    $.ajax({
      method: 'get',
      url: '../data/core/users',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      contentType: 'application/json'
    }).done(function(data) {
      console.log(data)
      var emails = []
      data.forEach(function(user) {
        if (user.credentials) {
          emails.push(user.credentials.email)
        } else {
          console.log('WARNING user without credention : ', user);
        }
      })
      this.trigger('all_profil_by_email_load', emails)
    }.bind(this));
  })


  this.on('update_user', function(data) {
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
    }).done(function(data) {
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
  this.on('navigation', function(entity, id, action) {
    if (entity == "profil") {
      this.menu = action;
      this.trigger('navigation_control_done', entity, action);
    }
  });

  this.on('deconnexion', function(message) {
    localStorage.token = null;
    localStorage.user_id = null;
    window.open("../auth/login.html", "_self");
  }.bind(this))


}
