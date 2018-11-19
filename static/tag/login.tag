<login class="containerV" style="background-color: rgb(238,242,249);background-size: cover; bottom:0;top:0;right:0;left:0;position:absolute">
  <!-- Chargement connexion  background-image: url(./image/log-f.jpg);-->
  <div id="containerLoaderDiv" if={isScrennToShow('loading')}>
    <div id="row">
      <div id="loaderDiv"></div>
      <h2 id="loaderText">
        Connexion en cours
      </h2>
    </div>
  </div>
  <!-- Header <div class="containerV" style="flex-grow:0;flex-shrink:0;"> <img src="./image/grappe-web1.png" style="margin-left:20px;height:50px; width:75px;justify-content:center;"> </div> <div class="header containerH" style="flex-shrink:0"
  show={!isScrennToShow('loading')}> <h1> Bienvenue sur Grappe </h1> </div> -->
  <div class="containerH header-login" show={!isScrennToShow('loading')} style="background-color: white; justify-content: flex-start;">
    <img src="./image/logo-grappe-web-c.png" style="margin-left:5px;display: flex;"></img>

  </div>
<!--   <div class="containerH" if={isScrennToShow('connexion')} style="color:rgb(26,145,194);justify-content: center;flex-wrap:wrap;">
    <div class="containerv">
      <h3>Une solution de traitement de données open-source pour piloter et maîtriser l'interopérabilité entre les données.</h3>
    </div>
  </div>
      <div class="containerH" if={isScrennToShow('connexion')} style="justify-content: center;flex-wrap:wrap;">
        <div class="containerv">
        <span>Connecter, traiter et exposer vos données en quelques clics.</span>
      </div>
    </div>-->

  <!-- box connexion-->
  <div class="containerH" if={isScrennToShow('connexion')} style="flex-wrap: wrap;overflow:auto;justify-content: center; align-items: center;flex-grow:2">
    <div class="containerV" style="justify-content: center;width: 600px;">
      <div class="containerH" style="flex-wrap:wrap;">

        <div class="containerV box" style="flex-grow:2">
<!-- Focus Connexion
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Connexion</h3>
          </div>-->
          <!-- champs Mail -->
          <label class="label-form">Email</label>
          <input id="email" type="email" ref="email" placeholder="saisissez une adresse email" class="field" onchange={emailChange} required="required"/>
          <!-- champs Mdp -->
          <label class="label-form">Mot de passe</label>
          <input type="password" ref="password" id="password" placeholder="saisissez un mot de passe" class="field" onchange={passwordChange} required="required"/>
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
              <a onclick={login} class="btn containerH" id="btn2" style="justify-content: center; align-items: center;flex:1">
                <span style="">Connexion</span>
              </a>
            </div>
            <!-- Bouton Google -->
            <span></span>
            <div class="containerH">
              <a href="/auth/google" class="btn containerH" style=" justify-content: center; align-items: center;flex:1" id="btn-google">
                <img src="../ihm/image/google-plus.png" alt="" id="googleP" style="padding-right: 10px;height: 25px; width:25px;">
                Connexion avec un compte Google</a>
            </div>
            <!-- Bouton inscription -->
            <label style="margin-bottom:20px;" class="label-form">Vous n'avez pas de compte Grappe ?
              <a class="url" onclick={hidePage}>
                Inscrivez-vous</a>
            </label>
          </div>
        </div>
      </div>
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
          <input class="field" ref="nameInscription" id="test-nameInscription" onchange={nameInscriptionChange} placeholder="saisissez votre nom" required="required">
          <div id="result">{resultName}</div>
          <!-- champs Statut -->
          <label class="label-form">Statut</label>
          <input class="field" ref="jobInscription" id="test-jobInscription" onchange={jobInscriptionChange} placeholder="saisissez votre statut"/>
          <div id="result">{resultJob}</div>
          <!-- Champs société -->
          <label class="label-form">Société</label>
          <input class="field" type="text" ref="societe" id="test-societeInscription" onchange={societeChange} placeholder="saisissez votre société"/>
          <div id="result">{resultSociete}</div>
          <!-- Champs mail -->
          <label class="label-form">Email *</label>
          <input class="field" type="email" id="test-emailInscription" onchange={emailInscriptionChange} ref="emailInscription" placeholder="saisissez votre Email"/>
          <div id="result">{resultEmail}</div>
          <!-- Champs mdp -->
          <label class="label-form">Mot de passe *</label>
          <input class="field" type="password" id="test-passwordInscription" onkeyup={passwordInscriptionKeyup} required="required" ref="passwordInscription" placeholder="saisissez votre mot de passe"/>
          <div id="result">{resultMdp}</div>
          <!-- Champs mdp2 -->
          <label class="label-form">Confirmer mot de passe *</label>
          <input class="field" type="password" id="test-confirmepasswordInscription" onkeyup={confirmPasswordInscriptionKeyup} required="required" ref="confirmPasswordInscription" placeholder="confirmer votre mot de passe"/>
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
          <input ref="emailforgotpassword" onchange={emailforgotpasswordChange} id="test-nameInscription" placeholder="saisissez votre Email" class="field" required="required">
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

  <!-- code d'activation mail-->
  <div class="containerH" if={isScrennToShow('enter_code')} style="justify-content: center; align-items: center;flex-grow:2">
    <div class="containerV" style="justify-content: center;width: 600px; height: 600px">
      <div class="containerH" style="flex-wrap:wrap;overflow:auto">
        <!-- Focus Code -->
        <div class="containerV box" style="flex-grow:2">
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Entrez le code envoyé par mail</h3>
          </div>
          <label class="label-form">Code</label>
          <input ref="codeforgotpassword" onchange={codeforgotpasswordChange} id="test-nameInscription" placeholder="saisissez le code" class="field" required="required"/>
          <p>{result_code}</p>
          <!--bouton envoyer + annuler -->
          <div onclick={verifecode} class=" btn containerH" style="justify-content: center; align-items: center;flex-wrap:wrap">
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

  <div class="containerH" if={isScrennToShow('forgot_password/changePassword') && isScrennAuthorizeBoolean} style="justify-content: center; align-items: center;flex-grow:2">
    <div class="containerV" style="justify-content: center;width: 600px; height: 600px">
      <div class="containerH" style="flex-wrap:wrap;overflow:auto">
        <!-- Focus Code -->
        <div class="containerV box" style="flex-grow:2">
          <div class="containerH" style="justify-content: center; align-items: center;">
            <h3>Changer votre mot de passe</h3>
          </div>
          <label class="label-form">Nouveau mot de passe</label>
          <input type="password" ref="new_password" onkeyup={new_passwordKeyup} id="password" placeholder="saisissez le nouveau mot de passe" class="field" required="required"/>
          <p>{result_password}</p>}
          <!--bouton envoyer + annuler -->
          <div onclick={verifecode} class=" btn containerH" style="justify-content: center; align-items: center;flex-wrap:wrap">
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

  <div class="containerH" show={isScrennToShow('forgot_password/changePassword') && !isScrennAuthorizeBoolean}>
    <div class="containerV">
      <div class="box">
        <div class="title-insc-block">
          <h2 style="color:rgb(117,117,117)">
            Vous ne devriez pas essayer d'acceder a cette url :o
          </h2>
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
      <span style="font-size: 0.75em;color:rgb(26,145,194)">Grappe v3.0 Copyright 2018
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
    this.isScrennAuthorizeBoolean = false
    this.urls = [
      '#loading',
      '#forgot_password/changePassword',
      '#forgot_password/changePassword',
      '#enter_code',
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

    this.isScrennAuthorize = function () {
      RiotControl.trigger('is_authorize', window.location.href.split('?'));
    }

    RiotControl.on("is_authorize_true", function (data) {
      this.isScrennAuthorizeBoolean = true
      this.update()
    }.bind(this));

    RiotControl.on("is_authorize_false", function () {
      this.isScrennAuthorizeBoolean = false
      this.update()
    }.bind(this));

    RiotControl.on("error_change_code", function () {
      this.result_code = "Le mot de passe entré n'est pas correct"
      this.update()
    }.bind(this));

    RiotControl.on('back_send_mail', function () {
      route('initiat')
      this.result_email = "Une erreur est survenu veuillez recommencer l'opération"
      this.update()
    }.bind(this));

    RiotControl.on("ajax_receipt_login", function (routeParams) {
      console.log("ajax-conexion", routeParams)
      route(routeParams)
      this.update()
    }.bind(this));

    RiotControl.on("ajax_send_login", function () {
      this.is_login = true
      route('/loading')
      this.update()
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

    validenewpassword() {
      let userId = window.location.href.split('?')[1].split("&code=")[0].split("u=")[1]
      if (userId && this.new_password) {
        RiotControl.trigger('update_password', {
          new_password: this.new_password,
          id: userId
        });
      } else {
        this.result_password = "Votre mot de passe est au mauvais format ( 6 caractères minimum )"
      }
    }

    sendpasswordbymail() {
      RiotControl.trigger('forgot_password', this.emailforgotpassword);
    }

    verifecode() {
      RiotControl.trigger('verife_code', {
        code: this.codeforgotpassword,
        user: this.user
      });
    }

    RiotControl.on('error_send_mail_code', function (user) {
      this.result_email = "Votre adresse email est introuvable"
      this.update()
    }.bind(this))

    RiotControl.on('good_code', function (user) {
      route('forgot_password/changePassword?u=' + this.user._id + "&code=" + this.user.resetpasswordmdp)
      this.update()
    }.bind(this))

    RiotControl.on('password_update_error', function (user) {
      this.result_password = "Votre mot de passe est au mauvais format ( 6 caractères minimum )"
      this.update()
    }.bind(this))

    RiotControl.on('password_update', function (user) {
      route('connexion')
      this.resultConnexion = "Votre mot de passe a bien été mis a jour"
      this.update()
    }.bind(this))

    RiotControl.on('token_expired', function (user) {
      route('initiat')
      this.result_email = "Token expiré renvoyé le mail ? "
      this.update()
    }.bind(this))

    //On recupere le user ici pour s'en servir pour construire les url par la suite

    RiotControl.on('enter_code', function (user) {
      route('enter_code')
      this.user = user
      this.update()
    }.bind(this))

    this.isGoogleUser();

    inscription(e) {
      if ((this.newUser.passwordInscription != undefined) && (this.newUser.confirmPasswordInscription != undefined) && (this.newUser.emailInscription != undefined)) {
        var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
        if (this.newUser.emailInscription.match(reg) != null) {
          //if(this.newUser.passwordInscription.split().length > 5){
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
        console.log(this.newUser.emailInscription, this.newUser.passwordInscription);
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
      console.log(this.user.password)
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

    $(document).ready(function () {
      $('.box').hide().fadeIn(1000);
      ///password
    });

    $('a').click(function (event) {
      event.preventDefault();
    });

    this.on('mount', function () {
      if (!window.location.href.split('login.html')[1]) {
        route('connexion')
      }
      route(function (entity, id, action) {
        if (entity == "forgot_password") {
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

    }.bind(this));
  </script>

  <style scoped="scoped">
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
      font-size: 1em;
      border-radius: 0;
      flex: 1;
    }

    .inscription-link {
      /*display: flex;
      justify-content: center;*/
      color: rgb(161,161,161);
    }
    /*LANDING CSS */
    /*.email-block {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding-top: 3vh;
    }*/

    /*.insc-block {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding-top: 3vh;
    }*/

    /*.intermediate-block {
      display: flex;
      padding-top: 3vh;
    }*/

    /*.password-block {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding-top: 3vh;
    }*/

    /*.connexion-block {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .google {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .google-block {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }*/

    /*.title-insc-block {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }*/

    /*#landingTitle {
      text-align: center;
      margin-top: 15vh;
    }

    #landingText {
      text-align: center;
      margin-top: 15vh;
    }*/

    /*.containerflexlanding {
      background-color: white;
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
    }*/

    /*.containerlanding {
      height: 90vh!important;
      background-color: white;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }*/

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
    /*.Aligner {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      background-color: white;
      justify-content: center;
    }*/

    /*h1 {
      padding: 5%;
      font-size: 1.5em;
      color: white;
    }*/

    .box {
      /*background: white;*#e6ecff;*/
      background: rgb(255,255,255);
      /*width: 500px;*/
      margin-top: 5vh;
      border: 1px solid rgba(133,133,133,0.38);
      /*padding: 10px;*/
      margin: 5px;
      padding: 5px;
      box-shadow: 0 0 5px 0 rgba(133,133,133,0.38);
    }

    /*.inscriptionChoice > div {
      margin: 5px;
      padding: 5px;
      background: #e6ecff;
    }*/
    /*
    .email {
      border: none;
      border-bottom: rgb(212,212,212) 1px solid;
      padding: 8px;
      color: rgb(161,161,161);
      margin-top: 10px;
      font-size: 1em;
      border-radius: 0;
      width: inherit;
    }*/

    /*.flex-container {
      display: flex;
      justify-content: space-around;
      padding-top: 3vh;
    }*/

    /*.password {
      border: none;
      border-bottom: rgb(212,212,212) 1px solid;
      color: rgb(161,161,161);
      padding: 8px;
      width: 250px;
      font-size: 1em;
      border-radius: 0;
      width: 100%;
      width: inherit;
    }*/

    /*.btn {
      background: #2ecc71;
      width: 125px;
      padding-top: 5px;
      padding-bottom: 5px;
      color: white;
      border-radius: 4px;
      border: #27ae60 1px solid;

      margin-top: 20px;
      margin-bottom: 20px;
      float: left;
      margin-left: 16px;
      font-weight: 800;
      font-size: 0.8em;
      cursor: pointer;
    }*/

    #googleP {
      width: 100px;
      height: 100px;
      /*position: absolute;*/
    }

    #btn-google {
      background: #dc4e41;
    }
    .btn:hover {
      background: #2CC06B;
    }

    .btn {
      /*text-align: center;
      width: 125px;*/
      background: #2ecc71;
      /*padding-top: 5px;
      padding-bottom: 5px;*/
      border-radius: 4px;
      border: #2980b9 1px solid;
      margin: 10px;
      padding: 10px;
      /*margin-bottom: 20px;
      margin-left: 10px;*/
      font-weight: 800;
      font-size: 0.8em;
      cursor: pointer;
    }

    #btn4 {
      background: #3498db;
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
