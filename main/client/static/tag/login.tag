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
      <!--  <div id="loaderDiv"></div>  -->
      <img id="loaderDiv" src="./image/grappe-log-02.png" height="50px" style="margin-left:5px;display: flex;">
      <h1 id="loaderText"> Requete en cours </h1>
      <!--  </h1>  -->
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
    <div class="containerV" style="justify-content: center;width: 600px; align-items:center">
      <form class="containerV boxLogin" style="flex-grow:2" onsubmit={login}>
        <!-- champs Mail -->
        <div class="inputContent">
          <label class="label-form" for="email">EMAIL</label>
          <input id="email" type="email" ref="email" placeholder="saisissez une adresse email" onchange={emailChange} required/>
        </div>

        <!-- champs Mdp -->
        <div class="inputContent">
          <label class="label-form" for="password">MOT DE PASSE</label>
          <input type="password" ref="password" id="password" placeholder="saisissez un mot de passe" onchange={passwordChange} required/>
        </div>
        <!-- spam erreur mdp or id -->
        <div id="result-co">{resultConnexion}</div>

        <!-- mdp oublié -->
        <div class="containerH" style="flex-wrap:wrap">
          <a onclick={f_password} class="url" style="flex:1;flex-basis:40%;">
            <span>Mot de passe oublié ?</span>
          </a>
        </div>

        <div class="containerV" style="align-items: center">
          <!-- Bouton connexion -->
          <div class="containerH">
            <button type="submit" class="btn secondary">Connexion</button>
          </div>

          <!-- Bouton Google -->
          <span></span>
          <div class="containerH">
            <a href="/data/auth/google" class="btn google">
              <img src="../ihm/image/google-plus.png" alt="" id="googleP" style="height:25px; width:25px; margin-top:-2px;">
              Connexion Google</a>
          </div>

          <!-- Bouton inscription -->
          <label style="margin-bottom:20px;" class="label-connexion">Vous n'avez pas de compte Grappe ?
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

        <div class="containerV boxLogin" style="flex-grow:2">
            <!-- Focus Inscription
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Inscription</h3>
          </div>-->
          <!-- champs Nom -->
          <div class="inputContent">
            <label class="label-form">NOM *</label>
            <input ref="nameInscription" id="test-nameInscription" onchange={nameInscriptionChange} placeholder="saisissez votre nom" required="required">
            <div id="result">{resultName}</div>
          </div>
          <!-- champs Statut -->
          <div class="inputContent">
            <label class="label-form">STATUT</label>
            <input ref="jobInscription" id="test-jobInscription" onchange={jobInscriptionChange} placeholder="saisissez votre statut"/>
            <div id="result">{resultJob}</div>
          </div>
          <!-- Champs société -->
          <div class="inputContent">
            <label class="label-form">SOCIETE</label>
            <input type="text" ref="societe" id="test-societeInscription" onchange={societeChange} placeholder="saisissez votre société"/>
            <div id="result">{resultSociete}</div>
          </div>
          <!-- Champs mail -->
          <div class="inputContent">
            <label class="label-form">EMAIL *</label>
            <input type="email" id="test-emailInscription" onchange={emailInscriptionChange} ref="emailInscription" placeholder="saisissez votre Email"/>
            <div id="result">{resultEmail}</div>
          </div>
          <!-- Champs mdp -->
          <div class="inputContent">
            <label class="label-form">MOT DE PASSE *</label>
            <input type="password" id="test-passwordInscription" onkeyup={passwordInscriptionKeyup} required="required" ref="passwordInscription" placeholder="saisissez votre mot de passe"/>
            <div id="result">{resultMdp}</div>
          </div>
          <!-- Champs mdp2 -->
          <div class="inputContent">
            <label class="label-form">CONFIRMER MOT DE PASSE *</label>
            <input type="password" id="test-confirmepasswordInscription" onkeyup={confirmPasswordInscriptionKeyup} required="required" ref="confirmPasswordInscription" placeholder="confirmer votre mot de passe"/>
            <div id="result">{resultMdpConfirme}</div>  
          </div>
          <!-- bouton Inscription -->
          <div class="containerH">
            <div onclick={inscription} id="btn" class="btn containerH" style="justify-content: center; align-items: center;flex:1">
              <a>Inscription</a>
            </div>
          </div>
          <!-- bouton connexion -->
          <label style="margin-bottom:20px;" class="label-connexion">Vous avez déjà un compte Grappe ?
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
        <div class="containerV boxLogin" style="flex-grow:2">
          <div class="containerH" style="justify-content: center; align-items: center;">
            <p>Réinitialisation mot de passe</p>
          </div>
          <div class="inputContent">
            <label class="label-form">EMAIL</label>
            <input ref="emailforgotpassword" onchange={emailforgotpasswordChange} id="test-nameInscription" placeholder="saisissez votre Email" required="required">
          </div>
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
        <div class="containerV boxLogin" style="flex-grow:2">
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Changer votre mot de passe</h3>
          </div>
          <label class="label-form">NOUVEAU MOT DE PASSE</label>
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
      'forgot_password/changePassword',
      'initiat',
      'inscription',
      'connexion'
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
      return screenToTest == this.entity;
    }

    closeError(e) {
      this.errorMessage = undefined;
    }

    closeSuccess(e) {
      this.sucessMessage = undefined;
    }

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
        this.persistInProgress = true;
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
      if (e.currentTarget.value.split("").length < 5) {
        this.resultMdp = "mot de passe invalide 6 caracteres minimum"
      } else {
        this.resultMdp = ""
      }
      this.newUser.passwordInscription = e.currentTarget.value;
    }.bind(this);

    this.confirmPasswordInscriptionKeyup = function (e) {
      if (this.newUser.passwordInscription != null && e.currentTarget.value != this.newUser.passwordInscription) {
        this.resultMdpConfirme = "confirmation mot de passe differentes"
      } else {
        this.resultMdpConfirme = ""
      }
      this.newUser.confirmPasswordInscription = e.currentTarget.value;
    }.bind(this);

    loginGoogle(e) {
      RiotControl.trigger('google_user_connect', this.user);
    }
    login(e) {
      if ((this.user.password != undefined) && (this.user.email != undefined) && (this.user.email != "") && (this.user.email != "")) {
        RiotControl.trigger('user_connect', this.user);
      } else {
        this.resultConnexion = "Remplissez votre email et mot de passe"
      }
    }

    this.isGoogleUser();

    this.on('mount', function () {
      if (!window.location.href.split('login.html')[1]) {
        window.location = "/ihm/login.html?#connexion"
      }
      route(function (entity, id, action) {    
        if(this.urls.includes(entity) === false){
          window.location = "/ihm/login.html?#connexion"
        }
        if (id == undefined && action == undefined) {
          this.entity = entity;
          this.update();
        } else {
          this.entity = entity + '/' + id;
          this.update();
        }
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
    .label-form {
      font-size: 0.75em;
    }
    .label-connexion {
      font-size: 1em;
      font-weight: 300
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
      color: white;
    }
    label {
      flex: 1;
    }

    input {
      border: rgb(212,212,212) 1px solid;
      padding: 8px;
      color: rgb(161,161,161);
      width:90%;
      font-size: 1em;
      border-radius: 2px;
      flex: 1;
    }
    ::placeholder{
      color: rgb(200,200,200);
      font-style: italic;
      opacity: 1; /* Firefox */
    }
    .inputContent {
      width: 100%;
      padding: 5px;
      display: flex;
      flex-direction: column;
    }

    .inscription-link {
      color: rgb(161,161,161);
    }

    #containerLoaderDiv {
      background-color: rgb(26,145,194);
      bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      position: absolute;
      z-index: 1;
    }
    #row {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #loaderDiv {
      width: 100px;
      animation: bounce 0.5s linear infinite;
      animation-direction: alternate;
    }
    @keyframes bounce {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1.4);
      }
    }

    #loaderText {
      padding-top: 3%;
      color: white;
      font-family: 'Raleway', sans-serif;
      text-align: center;
    }

    .persistInProgress {
      color: red;
    }

    #result {
      color: #ff6f69;
      font-size: 12px;
      font-family: 'Raleway', sans-serif;
    }

    #result-co {
      color: #ff6f69;
      font-size: 0.9em;
      font-family: 'Raleway', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 7pt;
    }

    .boxLogin {
      background: rgb(255,255,255);
      margin-top: 1vh;
      width: 90%;
      flex-wrap: wrap;
      padding: 2%;
      justify-content: center;
      align-items: center;
      flex-grow: 0.5;
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
      font-weight: 800;
      font-size: 0.8em;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      width: 25vw;
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
