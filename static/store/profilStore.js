function profilStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION 
  this.userCurrrent;

    this.on('load_profil', function(message) {
        console.log('show_profil');
        console.log(localStorage.user_id);
        $.ajax({
            method: 'get',
            url: '../data/core/users/'+ localStorage.user_id,
            headers: {
                "Authorization": "JTW" + " " + localStorage.token
            },
            contentType: 'application/json'
        }).done(function(data) {
            this.userCurrrent = data
            this.trigger('profil_loaded', this.userCurrrent)      
        }.bind(this));
    })

    this.on('change_email', function(email) {
        console.log('change_email');
        console.log(email);
        $.ajax({
            method: 'put',
            url: '../data/core/users/'+ localStorage.user_id,
            data: JSON.stringify({email: email}),
            headers: {
                "Authorization": "JTW" + " " + localStorage.token
            },
            contentType: 'application/json'
        }).done(function(data) {
            this.userCurrrent = data
            this.trigger('profil_loaded', this.userCurrrent)      
        }.bind(this));
    })

    this.on('deconnexion', function(message) {
        localStorage.token = null;
        localStorage.user_id = null;
        console.log(localStorage)
         window.open("../auth/login.html", "_self");
    }.bind(this))
}