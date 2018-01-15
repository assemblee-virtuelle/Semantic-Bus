<login style="flex-grow: 1;">
  <div id="containerloaderDiv" show={isScrennToShow('loading')}>
      <div id="row">
        <div id="loaderDiv"></div>
        <h1 id="loaderText"> Connection en cours </h1>
      </div>
    </div>
  <div class="header" style="align-items: center;height: 15%;"> 
  <h1> Bienvenue sur le bus Semantic</h1>
  </div>
<div class="containerH" show={isScrennToShow('connexion')}>
  <div class="containerV" style="flex-direction: column;">
  <h1 style="color:rgb(119,119,119)"></h1>
      <div class="box">
        <div class="google-block">
          <h2 style="color:rgb(117,117,117)"> 
          Choisissez votre connexion</h2>
          <div class="google" >
              <a href="/auth/google" style="display: flex;align-items: center;justify-content: center;"id="btn-google"><img src="../ihm/image/google-plus.png" alt="" id="googleP">  Connexion</a>
          </div>
        </div>
        <div class="intermediate-block">
          <hr style="flex-grow: 1;height: 0;
border: 0.2px solid rgb(228,228,228);">
          <p style="flex-grow: 0.3;display:flex;justify-content:center"><strong tyle="color: rgb(117,117,117);">Ou</strong></p>
          <hr style="color:rgb(117,117,117);flex-grow: 1;height: 0;
border: 0.2px solid rgb(228,228,228);">
        </div>
        <div class="connexion-block">
          <div class="email-block">
            <label style="color: rgb(161,161,161);align-self: left;">Email</label>
            <input id="email" type="email" ref="email" placeholder="saisir email" class="email" />
          </div>
          <div class="password-block">
            <label style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left">Mot de passe</label>
            <input type="password" ref="password" id="password" placeholder="saisir mot de passe" class="email" required />
          </div>
          <div class="password-block">
            <button onclick={f_password} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left">Mot de passe oublié ? </label>
          </div>
          <div id="result-co">{resultConnexion}</div>
          <div class="flex-container">
            <a onclick = {login} id="btn2">Connexion</a> 
        </div>
        </div>
      </div> <!-- End Box -->
      <div class="inscription-link">
        <p>Vous n'avez pas encore de compte ? <a onclick = {hidePage} style="cursor: pointer;color: black;">Inscription</a></p>
      </div>  
  </div>
</div>
<div class="containerH" show={isScrennToShow('inscription')}>
  <div class="containerV">
    <div class="box">
      <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)"> 
          Inscription</h2>
      </div>
      <div class="insc-name-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Nom</label>
        <input  ref="nameInscription" id="test-nameInscription" placeholder="saisir name (*)"  class="email" />
        <div id="result">{resultName}</div>
      </div>
      <div class="insc-job-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Job</label>
        <input  ref="jobInscription"  id="test-jobInscription" placeholder="saisir job"  class="email" />
        <div id="result">{resultJob}</div>
      </div>
      <div class="insc-societe-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Société</label>
        <input  ref="societe"  id="test-societeInscription" placeholder="saisir societe"  class="email" />
        <div id="result">{resultSociete}</div>
      </div>
      <div class="insc-email-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Email</label>
        <input type="email" id ="test-emailInscription"ref="emailInscription"  placeholder="saisir email (*)"  class="email" />
        <div id="result">{resultEmail}</div>
      </div>
      <div class="insc-mdp-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Mot de passe</label>
        <input type="password" id="test-passwordInscription" required ref="passwordInscription" placeholder="saisir mot de passe"  class="email" />
        <div id="result">{resultMdp}</div>
      </div>
      <div class="insc-cmdp-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Confirmer mot de passe</label>
        <input type="password"id="test-confirmepasswordInscription" required ref="confirmPasswordInscription" placeholder="confirmer mot de passe"  class="email" />
      </div>
      <div id="result">{resultMdpConfirme}</div>
      <div class="flex-container">
        <a onclick = {inscription} id="btn2">Inscription</a>
    </div>
    </div>
    <div class="inscription-link">
      <p>Vous avez deja un compte avec nous? <a onclick = {showPage} style="cursor: pointer;color: black;">Connectez vous</a></p>
    </div> 
  </div>
</div>

<div class="containerH"  show={isScrennToShow('initiat')}>
  <div class="containerV">
    <div class="box">
      <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)"> Entrez l'adresse email de votre compte</h2>
      </div>
      <div class="insc-name-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Email</label>
        <input ref="emailforgotpassword" id="test-nameInscription" placeholder="saisir email"  class="email" />
      </div>
      <div class="password-block">
        <a onclick={sendpasswordbymail} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left"> send mail</a>
        <a onclick={returnlogin} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left"> annuler</a>
      </div>
    </div>
    <p>{result_email}</p>
  </div>
</div>


<div class="containerH" show ={isScrennToShow('enter_code')}>
  <div class="containerV">
    <div class="box">
      <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)"> Entrez le code envoyé par mail </h2>
      </div>
      <div class="insc-name-box insc-block ">
        <label style="color: rgb(161,161,161);align-self: left;">Code</label>
        <input ref="codeforgotpassword" id="test-nameInscription" placeholder="saisir code"  class="email" />
      </div>
      <div class="password-block">
        <a onclick={verifecode} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left"> verife code</a>
        <a onclick={returnlogin} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left"> annuler</a>
      </div>
    </div>
     <p>{result_code}</p>
  </div>
</div>

<div class="containerH" show ={isScrennToShow('forgot_password/changePassword') && isScrennAuthorizeBoolean} >
  <div class="containerV">
    <div class="box">
      <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)"> Changer votre mot de passe </h2>
      </div>
      <div class="password-block">
        <label style="color: rgb(161,161,161);align-self: left;">nouveau mot de passe</label>
        <input type="password" ref="new_password" id="password" placeholder="saisir mot de passe" class="email" required />
      </div>
      <div class="password-block">
        <a onclick={validenewpassword} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left"> Valider</a>
        <a onclick={returnlogin} style="color:rgb(161,161,161);color: rgb(161,161,161);align-self: left"> annuler</a>
      </div>
    </div>
     <p>{result_password}</p>
  </div>
</div>

<div class="containerH" show ={isScrennToShow('forgot_password/changePassword') && !isScrennAuthorizeBoolean} >
  <div class="containerV">
    <div class="box">
      <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)"> 503 Composants!! Vous ne devriez pas essayer d'acceder a cette url :o </h2>
      </div>
    </div>
  </div>
</div>


<div class="containerH" show ={isScrennToShow(window.location.href.split('login.html#')[1]) && (urls.indexOf(window.location.href.split('login.html')[1]) == -1)} >
  <div class="containerV">
    <div class="box">
      <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)"> 404 Composants!! Vous tenter d'aller sur une url qui n'existe pas :/</h2>
      </div>
    </div>
  </div>
</div>



  <script>
  this.resultConnexion = "";
  this.resultEmail = "";
  this.resultSociete = "";
  this.resultName = "";
  this.resultJob = "";
  this.resultMdp = "";
  this.user = {};
  this.newUser = {}
  this.is_login = false;
  this.boole = true
  this.forgotpassword = false
  this.password_code = false
  this.change_password = false
  this.result_email =  ""
  this.badcodechangepassword = ""
  this.result_password = ""
  this.isScrennAuthorizeBoolean = false
  this.urls = ['#loading', '#forgot_password/changePassword','#forgot_password/changePassword','#enter_code','#initiat' ,'#inscription' ,'#connexion']


  Object.defineProperty(this, 'data', {
      set: function (data) {
      this.user =data;
      this.newUser = {}
      this.update();
    }.bind(this),
      get: function () {
      return this.user;
    }
  })


  this.isScrennToShow = function (screenToTest) {
    console.log(screenToTest == this.entity)
    return screenToTest == this.entity;
  }

  this.isScrennAuthorize = function(){
      RiotControl.trigger('is_authorize',window.location.href.split('?'));
  }

  RiotControl.on("is_authorize_true", function(data){
    this.isScrennAuthorizeBoolean = true
    this.update()
  }.bind(this));

  RiotControl.on("is_authorize_false", function(){
    this.isScrennAuthorizeBoolean = false
    this.update()
  }.bind(this));

  RiotControl.on("error_change_code", function(){
    this.result_code = "Le mot de passe entré n'est pas correct"
    this.update()
  }.bind(this));


  RiotControl.on('back_send_mail', function(){
    route('initiat')
    this.result_email = "Une erreur est survenu veuillez recommencer l'opération"
    this.update()
  }.bind(this));
  


  RiotControl.on("ajax_receipt_login", function(routeParams){
      console.log("ajax-conexion", routeParams)
      route(routeParams)
      this.update()
  }.bind(this));


    

  RiotControl.on("ajax_send_login", function(){
      this.is_login = true
      route('/loading')
      this.update()
  }.bind(this));


  this.isGoogleUser = function () {
     if(location.search.split('google_token=')[1] != null){
       var googleToken = location.search.split('google_token=')[1]
       RiotControl.trigger('google_connect', googleToken);
    }
  }

  f_password(){
    route('initiat')
  }

  returnlogin(){
    route('connexion')
  }


  validenewpassword(){
    let userId = window.location.href.split('?')[1].split("&code=")[0].split("u=")[1]
    if(userId && this.new_password){
      RiotControl.trigger('update_password',{new_password: this.new_password, id: userId});
    }else{
      this.result_password = "Votre mot de passe est au mauvais format ( 6 caractères minimum )"
    }
  }

  sendpasswordbymail(){
    RiotControl.trigger('forgot_password', this.emailforgotpassword);
  }

  verifecode(){
     RiotControl.trigger('verife_code', {code: this.codeforgotpassword, user: this.user});
  }

  RiotControl.on('error_send_mail_code', function(user){
    this.result_email = "Votre adresse email est introuvable"
    this.update()
  }.bind(this))  

  RiotControl.on('good_code', function(user){
    route('forgot_password/changePassword?u='+ this.user._id + "&code=" + this.user.resetpasswordmdp)
    this.update()
  }.bind(this))

  RiotControl.on('password_update_error', function(user){
    this.result_password = "Votre mot de passe est au mauvais format ( 6 caractères minimum )"
    this.update()
  }.bind(this))


  RiotControl.on('password_update', function(user){
    route('connexion')
    this.resultConnexion = "Votre mot de passe a bien été mis a jour"
    this.update()
  }.bind(this))  


  RiotControl.on('token_expired', function(user){
    route('initiat')
    this.result_email = "Token expiré renvoyé le mail ? "
    this.update()
  }.bind(this))

  //On recupere le user ici pour s'en servir pour construire les url par la suite

  RiotControl.on('enter_code', function(user){
    route('enter_code')
    this.user = user
    this.update()
  }.bind(this))


  this.isGoogleUser();


  inscription(e){
    if((this.newUser.passwordInscription != undefined) && (this.newUser.confirmPasswordInscription != undefined) && (this.newUser.emailInscription != undefined)){
        var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
        if(this.newUser.emailInscription.match(reg) != null){
          //if(this.newUser.passwordInscription.split().length > 5){
          if((this.newUser.passwordInscription == this.newUser.confirmPasswordInscription) && (this.newUser.passwordInscription.split("").length > 5)){
            RiotControl.trigger('user_inscription', this.newUser);
            RiotControl.on('google_user', function(){
              this.resultEmail = "Votre compte est déja relier à un compte google"
            }.bind(this));
            RiotControl.on('email_already_exist', function(){
              this.resultEmail = "L'email choisi existe déjà"
            }.bind(this));
            RiotControl.on('society_bad_format', function(){
              this.resultSociete = "Entrez un format de sociéte valide [A-Z,a-z] max 20 caractères"
            }.bind(this));
            RiotControl.on('bad_email', function(){
              this.resultEmail = "Entrez un format d'email valide lebusestmagique@dataplayer.com"
            }.bind(this));
            RiotControl.on('name_bad_format', function(){
              this.resultName = "Entrez un format de nom valide [A-Z,a-z] max 20 caractères"
            }.bind(this));
          }else{
            this.resultMdp = "mot de passe invalide 6 caracteres minimum"
          }
        }else{
          this.resultEmail = "Veuillez entrez un email Valide"
        }
      }else{
        this.resultEmail = "Votre email n'est pas renseigné"
        this.resultMdp = "Votre n'est mot de passe n'est pas renseigné"
    }
  }

  showPage(e){
    route('connexion')
    this.resultEmail =  "";
    this.resultConnexion = ""
  }

  hidePage(e){
    route('inscription')
    this.resultEmail =  "";
    this.resultConnexion = ""
  }
  login(e) {
    console.log(this.user.password)
    if((this.user.password != undefined) && (this.user.email != undefined) && (this.user.email != "" ) && (this.user.email != "")){
      RiotControl.trigger('user_connect', this.user);
      RiotControl.on('google_user', function(){
        console.log("Connectez vous avec Google")
        this.resultConnexion = "Votre email est déjà utilisé par une connexion Google";
        this.update();
      }.bind(this))
      RiotControl.on('bad_auth', function(){
        this.resultConnexion = "Vous n'exister pas en base de donnée inscrivez vous :)"
        this.update();
      }.bind(this));
      RiotControl.on('err_processus', function(){
        this.resultConnexion = "Erreur verification mot de passe"
        this.update();
      }.bind(this));
    }else{
      this.resultConnexion = "Remplissez votre email et mot de passe"
    }
  }

  loginGoogle(e){
      RiotControl.trigger('google_user_connect', this.user);
    }


  $(document).ready(function(){
      $('.box').hide().fadeIn(1000);
        ///password
  });


  $('a').click(function(event){
      event.preventDefault();
  });

  this.on('mount', function () {
    if(!window.location.href.split('login.html')[1]){
      route('connexion')
    }
    route(function (entity, id, action) {
      if(entity == "forgot_password"){
        this.isScrennAuthorize()
      }
      console.log(entity, id, action);
      //this.routePath=path; this.routeHistory=history;
      if (id == undefined && action == undefined) {
        this.entity = entity;
        this.update();
      } else {
        this.entity = entity + '/' + id;
        this.update();
      }
      //console.log('ROUTE', path); console.log('history',history)
    }.bind(this));
    route.start(true);


    this.refs.email.addEventListener('change',function(e){
      this.user.email = e.currentTarget.value;
      this.update();
    }.bind(this));

    this.refs.password.addEventListener('change',function(e){
      this.user.password = e.currentTarget.value;
       this.update();
    }.bind(this));

    this.refs.new_password.addEventListener('keyup',function(e){
      if(e.currentTarget.value.split("").length < 5){
        this.result_password = "mot de passe invalide 6 caracteres minimum"
      }else{
        this.result_password = ""
      }
      this.new_password = e.currentTarget.value;
       this.update();
    }.bind(this));

    this.refs.emailforgotpassword.addEventListener('change',function(e){
      this.emailforgotpassword = e.currentTarget.value;
       this.update();
    }.bind(this));

    this.refs.emailInscription.addEventListener('change',function(e){
      this.resultEmail = ""
      this.newUser.emailInscription = e.currentTarget.value;
      this.update();
    }.bind(this));

    this.refs.codeforgotpassword.addEventListener('change',function(e){
      this.codeforgotpassword = e.currentTarget.value;
      this.update();
    }.bind(this));

    this.refs.societe.addEventListener('change',function(e){
      this.resultSociete = ""
      this.newUser.societe = e.currentTarget.value;
       this.update();
    }.bind(this));

    this.refs.nameInscription.addEventListener('change',function(e){
      this.resultName = ""
      this.newUser.name = e.currentTarget.value;
       this.update();
    }.bind(this));

    this.refs.jobInscription.addEventListener('change',function(e){
      this.resultJob = ""
      this.newUser.job = e.currentTarget.value;
       this.update();
    }.bind(this));

    this.refs.passwordInscription.addEventListener('keyup',function(e){
      console.log(e.currentTarget.value.split(""))
      if(e.currentTarget.value.split("").length < 5){
        this.resultMdp = "mot de passe invalide 6 caracteres minimum"
      }else{
        this.resultMdp = ""
      }
      this.newUser.passwordInscription = e.currentTarget.value;
       this.update();
    }.bind(this));

     this.refs.confirmPasswordInscription.addEventListener('keyup',function(e){
       if(this.newUser.passwordInscription != null && e.currentTarget.value != this.newUser.passwordInscription){
          this.resultMdpConfirme = "confirmation mot de passe differntes"
       }else{
         this.resultMdpConfirme = ""
       }
      this.newUser.confirmPasswordInscription = e.currentTarget.value;
       this.update();
    }.bind(this));
  }.bind(this));

</script>
<style scoped>
  .inscription-link{
    display: flex;
    justify-content: center;
    padding: 10vh;
    color: rgb(161,161,161);
  }
  /*LANDING CSS */
  .email-block {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-top: 3vh;
  }

  .insc-block {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-top: 3vh;
  }

  .intermediate-block {
    display: flex;
    padding-top: 3vh;
  }

  .password-block {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-top: 3vh;
  }

  .connexion-block {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .google{
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .google-block {
    display:flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
  }

  .title-insc-block{
    display:flex;
    flex-direction:column;
    justify-content: center;
    align-items: center;
  }

  #landingTitle {
    text-align:center;
    margin-top: 15vh;
  }
  

  #landingText {
    text-align:center;
    margin-top: 15vh;
  }

  .containerflexlanding {
    background-color:white;
    width:100%;
    height:125vh;
    padding: 0;
    margin: 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .containerlanding {
    height:90vh!important;
    background-color:white;
    width:100%;
    height:100%;
    padding: 0;
    margin: 0;
  }

  #containerloaderDiv {
    background-color:rgba(200,200,200,0.8);
    width:100%;
    height:125vh;
    padding: 0;
    margin: 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    align-items: center;
    justify-content: center;
  }



  #row {
    width: auto;
    margin-top: -35vh;

  }

  #loaderText {
    padding-top:5%;
    color:#3498db;
    font-family: 'Raleway', sans-serif;
    text-align:center;
  }
  #loaderDiv {
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    margin-left:4vw
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
    .persistInProgress {
      color: red;
    }

    .persistInProgress {
      color: red;
    }
  #result {
    color:#dc4e41;
    font-size:12px;
    font-family: 'Raleway', sans-serif;
  }

  #result-co {
    color: #dc4e41;
    font-size: 0.9em;
    font-family: 'Raleway', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 7pt;
  }
  .Aligner {
  height:100%;
  width:100%;
  display: flex;
  align-items: center;
  background-color:white;
  justify-content: center;
}


  h1{
    padding:5%;
    font-size:1.5em;
    color:white;
  }

  .box{
    background:white;
    width:500px;
    margin-top:5vh;
    border: 1px solid rgba(133,133,133,0.38);
    padding:10px 10px 10px 10px;
    box-shadow: 0px 0px 5px 0px rgba(133,133,133,0.38);
  }

  .email{
    border: none;
    border-bottom: rgb(212,212,212) 1px solid;
    padding: 8px;
    color:rgb(161,161,161);
    margin-top:10px;
    font-size:1em;
    border-radius:0px;
    width: inherit;
  }

  .flex-container {
      display: flex;
      justify-content: space-around;
      padding-top:3vh;
  }

  .password{
    border: none;
    border-bottom: rgb(212,212,212) 1px solid;
    color:rgb(161,161,161);
    padding: 8px;
    width:250px;
    font-size:1em;
    border-radius:0px;
    width: 100%;
    width: inherit;
  }

  .btn{
    background:#2ecc71;
    width:125px;
    padding-top:5px;
    padding-bottom:5px;
    color:white;
    border-radius:4px;
    border: #27ae60 1px solid;

    margin-top:20px;
    margin-bottom:20px;
    float:left;
    margin-left:16px;
    font-weight:800;
    font-size:0.8em;
    cursor: pointer;
  }

  #googleP {
    width: 30px;
    position: absolute;
  }


  #btn-google {
    background: #dc4e41;
    width: 125px;
    color:#dc4e41;
    padding-top: 5px;
    padding-bottom: 5px;
    border-radius: 4px;
    margin-top: 20px;
    margin-bottom: 20px;
    float: left;
    margin-left: 16px;
    font-weight: 800;
    font-size: 0.8em;
  }

  .btn:hover{
    background:#2CC06B;
  }

   #btn4{
    float:left;
    background:#3498db;
    width:125px;  padding-top:5px;
    padding-bottom:5px;
    color:white;
    border-radius:4px;
    border: #2980b9 1px solid;

    margin-top:20px;
    margin-bottom:20px;
    margin-left:50px;
    font-weight:800;
    font-size:0.8em;
    cursor: pointer;
  }

  #btn2{
    text-align:center;
    background:rgb(37,167,239);
    width:125px;  padding-top:5px;
    padding-bottom:5px;
    color:white;
    border-radius:4px;
    border: #2980b9 1px solid;
    margin-top:20px;
    margin-bottom:20px;
    margin-left:10px;
    font-weight:800;
    font-size:0.8em;
    cursor: pointer;
  }

  #btn2:hover{
  background:#3594D2;
  }
  </style>
</login>
