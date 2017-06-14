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
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
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
        // window.open("../ihm/application.html", "_self");
        this.trigger('application_redirect')
      }else{
        this.trigger('email_already_exist')
      }
    });
  });

  this.on('google_user_connect', function() {
    console.log('google_user_connect');
    $.ajax({
      method: 'get',
      headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT',
            'Access-Control-Allow-Headers': 'Content-Type'
      },
      contentType: 'text/html',
      url: 'https://accounts.google.com/signin/oauth/oauthchooseaccount?client_id=497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com&as=-4e27348ec186f937&destination=http%3A%2F%2Flocalhost%3A3000&approval_state=!ChQwdmNPdElDWkpvT1NfQVlDU0tlYhIfZzQ4V21nclg2M0FTMEFCaFBpNzRuMC1zMXU1YXloVQ%E2%88%99ADiIGyEAAAAAWUJC432gMdo9GWxVk3FPc0JQbGpNF-d3&xsrfsig=AHgIfE_9RSu7-msQsNRqG0qn4xiKNDmLvg&flowName=GeneralOAuthFlow',
    }).done(data => {
      console.log(data);
      // if(data.user != null && data.token != null){
      //   localStorage.token = data.token
      //   window.open("../ihm/application.html", "_self");
      // }else{
      //   this.trigger('email_already_exist')
      // }
    });
  });
}
