function UserStore() {
  riot.observable(this) // Riot provides our event emitter.
  ////LE USER STORE EST RELIE A LOGIN EST NON A APPLICATION
  this.userCurrrent;

  this.on('user_connect', function(user) {
    // console.log(user);
    $.ajax({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/auth/authenticate',
    }).done(data => {
      console.log(data);
      if(data.user != null && data.token != null){
        localStorage.token = data.token
        window.open("../ihm/application.html", "_self");
      }else{
        console.log("data no");
        this.trigger('bad_auth')
      }
    });
  });


  this.on('user_inscription', function(user) {
    // console.log(user);
    $.ajax({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/auth/inscription',
    }).done(data => {
      console.log(data);
      if(data.user != null && data.token != null){
        localStorage.token = data.token
        window.open("../ihm/application.html", "_self");
      }else{
        this.trigger('email_already_exist')
      }
    });
  });
}
