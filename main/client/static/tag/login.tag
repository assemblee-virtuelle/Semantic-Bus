<login class="containerV" style="background-color: rgb(238,242,249);background-size: cover; bottom:0;top:0;right:0;left:0;position:absolute">
  <!-- Chargement connexion  background-image: url(./image/log-f.jpg);-->
  <div id="containerErrorDiv" class="containerV" if={errorMessage}>
    <div class="containerH commandBar errorMessage"  style="pointer-events:auto;">
      <div>{errorMessage}</div>
      <div onclick={closeError} style="margin-left: 50px; cursor:pointer"><img src="./image/cross.svg" height="20px"></div>
    </div>
  </div>
  <div id="containerErrorDiv" class="containerV" if={sucessMessage} >
    <div class="containerH commandBar successMessage" style="pointer-events:auto;">
      <div>{sucessMessage}</div>
      <div onclick={closeSuccess} style="margin-left: 50px; cursor:pointer"><img src="./image/cross.svg" height="20px"></div>
    </div>
  </div>
  <div id="containerLoaderDiv" if={persistInProgress} class="containerV" style="justify-content:center">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText">
        synchronisation avec le serveur
      </h1>
    </div>
  </div>

  <div class="containerH header-login" show={!isScrennToShow('loading')} style="background-color: white; ">
    <img src="./image/grappe-log-01.png" height="50px"style="margin-left:5px;display: flex;"></img>
    <div class="containerH header-login"style="flex-grow:1;justify-content:center;">
      <img src="./image/grappe-title-01.png" height="25px"style="display: flex;"></img>
    </div>
    <div class="containerH header-login" style="padding-right:105px;">
    </div>
  </div>

  <!-- box connexion-->
  <div class="containerH" if={isScrennToShow('connexion')} style="flex-wrap: wrap;overflow:auto;justify-content: center; align-items: center;flex-grow:2">
    <div class="containerV" style="justify-content: center;width: 600px;">
      <form class="containerV box" style="flex-grow:2" onsubmit={login}>
        <!-- champs Mail -->
        <label class="label-form" for="email">Email</label>
        <input id="email" type="email" ref="email" placeholder="saisissez une adresse email" onchange={emailChange} required/>

        <!-- champs Mdp -->
        <label class="label-form" for="password">Mot de passe</label>
        <input type="password" ref="password" id="password" placeholder="saisissez un mot de passe" onchange={passwordChange} required/>

        <!-- spam erreur mdp or id -->
        <div id="result-co">{resultConnexion}</div>

        <!-- mdp oublié -->
        <div class="containerH" style="padding-left: 10px;flex-wrap:wrap">
          <a onclick={f_password} class="url" style="flex:1;flex-basis:40%;">
            <span>Mot de passe oublié ?</span>
          </a>
        </div>

        <div class="containerV">
          <!-- Bouton connexion -->
          <div class="containerH">
            <button type="submit" class="btn secondary">Connexion</button>
          </div>

          <!-- Bouton Google -->
          <span></span>
          <div class="containerH">
            <a href="/data/auth/google" class="btn google">
              <img src="../ihm/image/google-plus.png" alt="" id="googleP" style="padding-right: 10px;height: 25px; width:25px;">
              Connexion avec un compte Google</a>
          </div>

          <!-- Bouton inscription -->
          <label style="margin-bottom:20px;" class="label-form">Vous n'avez pas de compte Grappe ?
            <a class="url" onclick={hidePage}>
              Inscrivez-vous</a>
          </label>
        </div>
      </form>
    </div>
  </div>

  <!-- box inscription -->

  <div class="containerH" if={isScrennToShow('inscription')} style="flex-wrap: wrap;justify-content: center; align-items: center;overflow:auto;flex-grow:2">
    <div class="containerV" style="width: 600px;">
      <div class="containerH" style="flex-wrap:wrap;overflow:auto">

        <div class="containerV box" style="flex-grow:2">
            <!-- Focus Inscription
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Inscription</h3>
          </div>-->
          <!-- champs Nom -->
          <label class="label-form">Nom *</label>
          <input ref="nameInscription" id="test-nameInscription" onchange={nameInscriptionChange} placeholder="saisissez votre nom" required="required">
          <div id="result">{resultName}</div>
          <!-- champs Statut -->
          <label class="label-form">Statut</label>
          <input ref="jobInscription" id="test-jobInscription" onchange={jobInscriptionChange} placeholder="saisissez votre statut"/>
          <div id="result">{resultJob}</div>
          <!-- Champs société -->
          <label class="label-form">Société</label>
          <input type="text" ref="societe" id="test-societeInscription" onchange={societeChange} placeholder="saisissez votre société"/>
          <div id="result">{resultSociete}</div>
          <!-- Champs mail -->
          <label class="label-form">Email *</label>
          <input type="email" id="test-emailInscription" onchange={emailInscriptionChange} ref="emailInscription" placeholder="saisissez votre Email"/>
          <div id="result">{resultEmail}</div>
          <!-- Champs mdp -->
          <label class="label-form">Mot de passe *</label>
          <input type="password" id="test-passwordInscription" onkeyup={passwordInscriptionKeyup} required="required" ref="passwordInscription" placeholder="saisissez votre mot de passe"/>
          <div id="result">{resultMdp}</div>
          <!-- Champs mdp2 -->
          <label class="label-form">Confirmer mot de passe *</label>
          <input type="password" id="test-confirmepasswordInscription" onkeyup={confirmPasswordInscriptionKeyup} required="required" ref="confirmPasswordInscription" placeholder="confirmer votre mot de passe"/>
          <!-- bouton Inscription -->
          <div id="result">{resultMdpConfirme}</div>
          <div onclick={inscription} id="btn" class="btn containerH" style="justify-content: center; align-items: center;flex:1">
            <a>Inscription</a>
          </div>
          <!-- bouton connexion -->
          <label style="margin-bottom:20px;" class="label-form">Vous avez déjà un compte Grappe ?
            <a class="url" onclick={showPage}>
              Connectez-vous</a>
          </label>

        </div>
      </div>
    </div>
  </div>

  <!-- box mot de passe oublié -->
  <div class="containerH" if={isScrennToShow('initiat')} style="justify-content: center; align-items: center;flex-grow:2">
    <div class="containerV" style="justify-content: center;width: 600px; height: 600px">
      <div class="containerH" style="flex-wrap:wrap;overflow:auto">
        <!-- Focus MDP -->
        <div class="containerV box" style="flex-grow:2">
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Réinitialisation mot de passe</h3>
          </div>
          <label class="label-form">Email</label>
          <input ref="emailforgotpassword" onchange={emailforgotpasswordChange} id="test-nameInscription" placeholder="saisissez votre Email" required="required">
          <p style="color:red">{result_email}</p>
          <!--bouton envoyer + annuler -->
          <div onclick={sendpasswordbymail} class=" btn containerH" style="justify-content: center; align-items: center;flex-wrap:wrap">
            <a>Envoyer</a>
          </div>
          <div onclick={returnlogin} class="btn containerH" id="btn2" style="justify-content: center; align-items: center;flex-wrap:wrap">
            <a>Annuler</a>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Changer de mot de passe -->

  <div class="containerH" if={isScrennToShow('forgot_password/changePassword')} style="justify-content: center; align-items: center;flex-grow:2">
    <div class="containerV" style="justify-content: center;width: 600px; height: 600px">
      <div class="containerH" style="flex-wrap:wrap;overflow:auto">
        <!-- Focus Code -->
        <div class="containerV box" style="flex-grow:2">
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Changer votre mot de passe</h3>
          </div>
          <label class="label-form">Nouveau mot de passe</label>
          <input type="password" ref="new_password" onkeyup={new_passwordKeyup} id="password" placeholder="saisissez le nouveau mot de passe" required="required"/>
          <p>{result_password}</p>
          <!--bouton envoyer + annuler -->
          <div onclick={updatePassword} class=" btn containerH" style="justify-content: center; align-items: center;flex-wrap:wrap">
            <a>Envoyer</a>
          </div>
          <div onclick={returnlogin} class="btn containerH" id="btn2" style="justify-content: center; align-items: center;flex-wrap:wrap">
            <a>Annuler</a>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- A quoi sert cette page ? -->

  <div class="containerH" show={isScrennToShow(window.location.href.split('login.html#')[1]) && (urls.indexOf(window.location.href.split('login.html')[1]) == -1)}>
    <div class="containerV">
      <div class="box">
        <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)">
            404 Composants!! Vous tenter d'aller sur une url qui n'existe pas :/</h2>
        </div>
      </div>
    </div>
  </div>

  <!--footer-->
  <div class="containerH" show={!isScrennToShow('loading')} style="justify-content: flex-end;height: 50px;margin-bottom:20px">
    <div class="containerV" style="justify-content: flex-end;margin-right:20px">
      <span style="font-size: 0.75em;color:rgb(26,145,194)">Grappe v0.3 Copyright 2018
        <a link="link" href="https://data-players.com/" style="color:rgb(26,145,194)">Data Players</a>
      </span>
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
    this.result_email = ""
    this.badcodechangepassword = ""
    this.result_password = ""
    this.urls = [
      '#loading',
      '#forgot_password/changePassword',
      '#initiat',
      '#inscription',
      '#connexion'
    ]

    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.user = data;
        this.newUser = {}
        this.update();
      }.bind(this),
      get: function () {
        return this.user;
      }
    })

    this.isScrennToShow = function (screenToTest) {
      //console.log(screenToTest == this.entity)
      return screenToTest == this.entity;
    }

    closeError(e) {
      this.errorMessage = undefined;
    }

    closeSuccess(e) {
      this.sucessMessage = undefined;
    }

    RiotControl.on('back_send_mail', function () {
      route('initiat')
      this.result_email = "Une erreur est survenu veuillez recommencer l'opération"
      this.update()
    }.bind(this));

    RiotControl.on('ajax_fail', function (message) {
      this.errorMessage = message;
      this.update();
    }.bind(this));

    RiotControl.on('ajax_sucess', function (message) {
      this.sucessMessage = message;
      this.update();
    }.bind(this));

    this.isGoogleUser = function () {
      if (location.search.split('google_token=')[1] != null) {
        var googleToken = location.search.split('google_token=')[1]
        RiotControl.trigger('google_connect', googleToken);
      }
    }

    f_password() {
      route('initiat')
    }

    returnlogin() {
      route('connexion')
    }

    sendpasswordbymail() {
      RiotControl.trigger('forgot_password', this.emailforgotpassword);
    }

    updatePassword() {
      RiotControl.trigger('updatePassword', {
        user: {password: this.new_password}
      });
    }

    RiotControl.on('error_send_mail_code', function (user) {
      this.result_email = "Votre adresse email est introuvable"
      this.update()
    }.bind(this))


    RiotControl.on('enter_code', function (user) {
      route('enter_code')
      this.user = user
      this.update()
    }.bind(this))


    inscription(e) {
      if ((this.newUser.passwordInscription != undefined) && (this.newUser.confirmPasswordInscription != undefined) && (this.newUser.emailInscription != undefined)) {
        var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
        if (this.newUser.emailInscription.match(reg) != null) {
          if ((this.newUser.passwordInscription == this.newUser.confirmPasswordInscription) && (this.newUser.passwordInscription.split("").length > 5)) {

            RiotControl.on('google_user', function () {
              this.resultEmail = "Votre compte est déja relier à un compte google"
            }.bind(this));
            RiotControl.on('email_already_exist', function () {
              this.resultEmail = "L'email choisi existe déjà"
            }.bind(this));
            RiotControl.on('society_bad_format', function () {
              this.resultSociete = "Entrez un format de sociéte valide [A-Z,a-z] max 20 caractères"
            }.bind(this));
            RiotControl.on('bad_email', function () {
              this.resultEmail = "Entrez un format d'email valide lebusestmagique@dataplayer.com"
            }.bind(this));
            RiotControl.on('name_bad_format', function () {
              this.resultName = "Entrez un format de nom valide [A-Z,a-z] max 20 caractères"
            }.bind(this));

            RiotControl.trigger('user_inscription', this.newUser);
          } else {
            this.resultMdp = "mot de passe invalide 6 caracteres minimum"
          }
        } else {
          this.resultEmail = "Veuillez entrez un email Valide"
        }
      } else {
        if (this.newUser.emailInscription == undefined) {
          this.resultEmail = "Votre email n'est pas renseigné"
        }
        if (this.newUser.passwordInscription == undefined) {
          this.resultMdp = "Votre mot de passe n'est pas renseigné"
        }
        if (this.newUser.confirmPasswordInscription == undefined) {
          this.resultMdpConfirme = "Votre confirmation de mot de passe n'est pas renseigné"
        }

      }
    }

    showPage(e) {
      route('connexion')
      this.resultEmail = "";
      this.resultConnexion = ""
    }

    hidePage(e) {
      route('inscription')
      this.resultEmail = "";
      this.resultConnexion = ""
    }

    login(e) {
      if ((this.user.password != undefined) && (this.user.email != undefined) && (this.user.email != "") && (this.user.email != "")) {
        RiotControl.trigger('user_connect', this.user);
        RiotControl.on('google_user', function () {
          console.log("Connectez vous avec Google")
          this.resultConnexion = "Votre email est déjà utilisé par une connexion Google";
          this.update();
        }.bind(this))
        RiotControl.on('bad_auth', function () {
          this.resultConnexion = "Vous n'exister pas en base de donnée inscrivez vous :)"
          this.update();
        }.bind(this));
        RiotControl.on('err_processus', function () {
          this.resultConnexion = "Erreur verification mot de passe"
          this.update();
        }.bind(this));
      } else {
        this.resultConnexion = "Remplissez votre email et mot de passe"
      }
    }

    this.emailChange = function (e) {
      this.user.email = e.currentTarget.value;
    }.bind(this);

    this.passwordChange = function (e) {
      this.user.password = e.currentTarget.value;
    }.bind(this);

    this.new_passwordKeyup = function (e) {
      if (e.currentTarget.value.split("").length < 5) {
        this.result_password = "mot de passe invalide 6 caracteres minimum"
      } else {
        this.result_password = ""
      }
      this.new_password = e.currentTarget.value;
    }.bind(this);

    this.emailforgotpasswordChange = function (e) {
      this.emailforgotpassword = e.currentTarget.value;
    }.bind(this);

    this.emailInscriptionChange = function (e) {
      this.resultEmail = ""
      this.newUser.emailInscription = e.currentTarget.value;
    }.bind(this);

    this.codeforgotpasswordChange = function (e) {
      this.codeforgotpassword = e.currentTarget.value;
    }.bind(this);

    this.societeChange = function (e) {
      this.resultSociete = ""
      this.newUser.societe = e.currentTarget.value;
    }.bind(this);

    this.nameInscriptionChange = function (e) {
      this.resultName = ""
      this.newUser.name = e.currentTarget.value;
    }.bind(this);

    this.lastNameInscriptionChange = function (e) {
      this.resultName = ""
      this.newUser.lastName = e.currentTarget.value;
    }.bind(this);

    this.jobInscriptionChange = function (e) {
      this.resultJob = ""
      this.newUser.job = e.currentTarget.value;
    }.bind(this);

    this.passwordInscriptionKeyup = function (e) {
      //console.log(e.currentTarget.value.split(""))
      if (e.currentTarget.value.split("").length < 5) {
        this.resultMdp = "mot de passe invalide 6 caracteres minimum"
      } else {
        this.resultMdp = ""
      }
      this.newUser.passwordInscription = e.currentTarget.value;
    }.bind(this);

    this.confirmPasswordInscriptionKeyup = function (e) {
      if (this.newUser.passwordInscription != null && e.currentTarget.value != this.newUser.passwordInscription) {
        this.resultMdpConfirme = "confirmation mot de passe differntes"
      } else {
        this.resultMdpConfirme = ""
      }
      this.newUser.confirmPasswordInscription = e.currentTarget.value;
    }.bind(this);

    loginGoogle(e) {
      RiotControl.trigger('google_user_connect', this.user);
    }

    this.isGoogleUser();

    this.on('mount', function () {
      if (!window.location.href.split('login.html')[1]) {
        route('connexion')
      }
      route(function (entity, id, action) {
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

    }.bind(this));
  </script>

  <style scoped="scoped">

    #containerErrorDiv {
      background-color: rgba(200,200,200,0);
      bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      position: absolute;
      z-index: 2;
      pointer-events: none;
    }
    .errorMessage {
      background-color: #fe4a49 !important;
      color: white ! important;
      z-index: 999;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .successMessage {
          background-color: rgb(41,171,135) !important;
          color: white !important;
          z-index: 999;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
    }
    .header {
      /*background: linear-gradient(90deg, rgb(33,150,243) 20% ,rgb(41,181,237));*/
      color: white;
    }
    label {
      margin-top: 10px;
      flex: 1;
    }

    input {
      border: none;
      border-bottom: rgb(212,212,212) 1px solid;
      padding: 8px;
      color: rgb(161,161,161);
      margin-top: 5px;
      width:90%;
      font-size: 1em;
      border-radius: 0;
      flex: 1;
    }

    .inscription-link {
      /*display: flex;
      justify-content: center;*/
      color: rgb(161,161,161);
    }

    #containerLoaderDiv {
      background-color: rgba(200,200,200,0.6);
      width: 100%;
      height: 125vh;
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
      padding-top: 5%;
      color: #3498db;
      font-family: 'Raleway', sans-serif;
      text-align: center;
    }
    #loaderDiv {
      border: 16px solid #f3f3f3;
      border-top: 16px solid #3498db;
      border-radius: 50%;
      width: 120px;
      height: 120px;
      animation: spin 2s linear infinite;
      margin-left: 4vw;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .persistInProgress {
      color: red;
    }

    #result {
      color: #dc4e41;
      font-size: 12px;
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

    .box {
      /*background: white;*#e6ecff;*/
      background: rgb(255,255,255);
      /*width: 500px;*/
      margin-top: 5vh;
      /*padding: 10px;*/
    }

    #googleP {
      width: 100px;
      height: 100px;
      /*position: absolute;*/
    }

    .btn:hover {
      background: #2CC06B;
    }

    .btn {
      background: #2ecc71;
      border-radius: 4px;
      border:none;
      margin: 10px;
      padding: 10px;
      font-weight: 800;
      font-size: 0.8em;
      cursor: pointer;

      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
    }

    .btn.primary {
      border: #2980b9 1px solid;
      background: #2ecc71;
      color: white;
    }

    .btn.primary:hover {
      background: #2CC06B;
    }

    .btn.secondary {
      background: rgb(37,167,239);
      color: white;
    }

    .btn.secondary:hover {
      background: #3594D2;
    }

    .btn.google {
      background: #dc4e41;
      color: white;
    }

    #btn2 {
      background: rgb(37,167,239);
      color: white;
    }
    #btn2:hover {
      background: #3594D2;
    }
  </style>
</login>
