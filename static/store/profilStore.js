function profilStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.userCurrrent;

    this.on('load_profil', function(message) {
        console.log('show_profil', localStorage.user_id);
        // console.log(localStorage.user_id);
        $.ajax({
            method: 'get',
            url: '../data/core/users/'+ localStorage.user_id,
            headers: {
                "Authorization": "JTW" + " " + localStorage.token
            },
            contentType: 'application/json'
        }).done(function(data) {
            this.userCurrrent = data
            console.log("load profil |",  this.userCurrrent)
            this.trigger('profil_loaded', this.userCurrrent)
        }.bind(this));
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
            data.forEach(function(user){
                if(user.credentials){
                  emails.push(user.credentials.email)
                }else{
                  console.log('WARNING user without credention : ',user);
                }
            })
            this.trigger('all_profil_by_email_load', emails)
        }.bind(this));
    })


    this.on('change_email', function(data) {
        console.log('change_email');
        console.log(JSON.stringify(data));
        $.ajax({
            method: 'put',
            url: '../data/core/users/'+ localStorage.user_id,
            data: JSON.stringify(data),
            headers: {
                "Authorization": "JTW" + " " + localStorage.token
            },
            contentType: 'application/json'
        }).done(function(data) {
            console.log(data)
            // if(data != false){
            //     this.userCurrrent = data
            //     this.trigger('email_change', this.userCurrrent)
            // }else{
            //     this.trigger('email_already_exist')
            // }
        }.bind(this));
    })

    this.on('deconnexion', function(message) {
        localStorage.token = null;
        localStorage.user_id = null;
        window.open("../auth/login.html", "_self");
    }.bind(this))

  
}
