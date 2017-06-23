function profilStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION 
  this.userCurrrent;

    this.on('load_profil', function(message) {
        console.log('show_profil');
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
            // console.log("load profil |",  this.userCurrrent)
            this.trigger('profil_loaded', this.userCurrrent)      
        }.bind(this));
    })


    this.on('load_all_profil_by_email', function(message) {
        console.log('load_all_profil_by_email');
        // console.log(localStorage.user_id);
        $.ajax({
            method: 'get',
            url: '../data/core/users',
            headers: {
                "Authorization": "JTW" + " " + localStorage.token
            },
            contentType: 'application/json'
        }).done(function(data) {
            console.log(data)
            // console.log("load profil |",  this.userCurrrent)
            var email = []
            data.forEach(function(user){
                email.push(user.email)
            })
            this.trigger('all_profil_by_email_load', email)      
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
            console.log(data)
            if(data != false){
                this.userCurrrent = data
                this.trigger('email_change', this.userCurrrent)
            }else{
                this.trigger('email_already_exist') 
            }             
        }.bind(this));
    })

    this.on('deconnexion', function(message) {
        localStorage.token = null;
        localStorage.user_id = null;
        localStorage.googleid = null;
        console.log(localStorage)
         window.open("../auth/login.html", "_self");
    }.bind(this))

     ///GESTION DES DROIT DE USER

    this.on('share-worksapce', function(data) {
        console.log('share-worksapce');
        console.log(data);
        $.ajax({
            method: 'put',
            url: '../data/core/share/workspace',
            data: JSON.stringify(data),
            headers: {
                "Authorization": "JTW" + " " + localStorage.token
            },
            beforeSend: function(){
                console.log("before send")
                this.trigger('share_change_send');
            }.bind(this),
            contentType: 'application/json'
        }).done(function(data) {
            console.log(data)
            if(data == false){
                this.trigger('share_change_no_valide') 
            }else if (data == "already"){
                this.trigger('share_change_already') 
            }else{
                this.userCurrrent = data
                this.trigger('share_change', this.userCurrrent) 
            }             
        }.bind(this));
    })
}