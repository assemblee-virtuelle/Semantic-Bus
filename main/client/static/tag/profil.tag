<profil class="containerV">

  <!-- Nav Bar -->
  <div class=" containerH containerNavBarTop">
    <a href="#profil//edit" class="commandButtonImage navBarTop containerV" style={this.backgroundActive("edit")}>
      <img src="./image/menu/id-card.png" height="40px" width="40px">
      Editer
      <div if={menu=='edit'} class="containerH arrow">
        <div class="containerV" style="justify-content:flex-end;">
          <div class="arrow-up"></div>
        </div>
      </div>
    </a>
    <!-- Consommation-->
    <a href="#profil//running" class="commandButtonImage navBarTop containerV" style={this.backgroundActive("running")}>
      <img src="./image/menu/chart-.png" height="40px" width="40px">
      Consommation
      <div if={menu=='running'} class="containerH arrow">
        <div class="containerV" style="justify-content:flex-end;">
          <div class="arrow-up"></div>
        </div>
      </div>
    </a>
    <!-- crédit -->
    <a href="#profil//payement" class="commandButtonImage navBarTop containerV" style={this.backgroundActive("payement")}>
      <img src="./image/menu/credit-card.png" height="40px" width="40px">
      Crédits
      <div if={menu=='payement'} class="containerH arrow">
        <div class="containerV" style="justify-content:flex-end;">
          <div class="arrow-up"></div>
        </div>
      </div>
    </a>
    <!-- Déconnexion -->
    <a onclick={deconnexion} class="commandButtonImage navBarTop containerV" style="background-color: rgb(124,195,232)">
      <img src="./image/menu/log-out.png" height="40px" width="40px">
      Déconnexion
    </a>
  </div>

  <!-- Graphique consommation -->
  <div class="containerV" if={menu=='running'} style="margin-top: 10vh;">
    <graph-of-use-workspace></graph-of-use-workspace>
  </div>
  <!-- Page Editer -->
  <div if={menu=='edit'} class="containerEdit">
    <div class="containerInformation">
      <!-- Nom d'utilisateur -->
      <label class="labelFormStandard">Nom d'utilisateur</label>
      <div class="cardParameter">
        <input class="inputStandard" value="{profil.name}" ref="name" onchange={changeNameInput}>
      </div>
      <!-- Email -->
      <label class="labelFormStandard">Email</label>
      <div class="cardParameter">
        <input class="inputStandard" value="{profil.credentials.email}" ref="email" readonly="readOnly">
      </div>
      <!-- Société -->
      <label class="labelFormStandard">Société</label>
      <div class="cardParameter">
        <input class="inputStandard" value="{profil.society}" placeholder="saisissez votre société" name="society" onchange={changeSocietyInput}>
      </div>
      <!-- Emploi -->
      <label class="labelFormStandard">Statut</label>
      <div class="cardParameter">
        <input class="inputStandard" value="{profil.job}" placeholder="saisissez votre statut" name="job" onchange={changeJobInput}>
      </div>
      <!-- info mail -->
      <div class="containerV" if={mailsend} style="justify-content: center; align-items: center;/* flex-grow: 1; */">
        <div>Un email à été envoyé, verifier votre boite mail.</div>
      </div>
      <!--boutons renvoyer mail -->
      <span style="padding:20px">** L'email ne peut être modifier pour le moment veuillez recreer un compte et vous partager vos workflow en cas de changement</span>
      <div if={!profil.active}>
        <div if={!mailsend}>
          <span style="padding:20px" id="bad-mail">!!!! Vous n'avez pas valider votre email (consulter vos mails / spam ) Vous ne pourrez utiliser l'outils sans un mail confirmer !!!!</span >
        </div>
        <div class="containerH" if={profil.googleId == null || profil.googleId=='undefined' } style="margin-top:20px;">
          <button class="button-profil" onclick={sendbackmail} type="button">{emailtext}</button>
        </div>
      </div>
    </div>
    <!-- Validation modifications-->
    <div class="containerValidate">
      <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultSociety}</div>
      <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultJob}</div>
    </div>
    <!-- Bouton valider -->
    <div class="containerBtn">
      <button class="button-profil" onclick={updateUser} type="button">Mettre à jour</button>
    </div>
  </div>
  <!-- Paramétre -->
  <div class="containerV" if={menu=='setting'} style="margin-top: 10vh;">
    <div class="containerV" style="flex-grow:1;justify-content:center;align-items: center;">
      <span class="title-profil">
        Nous esperons que votre expérience sur cet outil était satisfaisante ? à bientôt.</span>
      <button
        style="padding: 0.6em;
              border-radius: 25px;
              background-color:rgb(41,177,238);
              color: white;
              font-size: 20px;
              margin-top: 20px;
              text-align: center;
              border: none;"
        onclick={deconnexion}
        type="button">Déconnexion</button>
    </div>
  </div>
  <!-- Page paiement -->
  <div class="containerV" if={menu=='payement'} style="margin-top: 10vh;">
    <stripe-component-tag></stripe-component-tag>
  </div>

  <div class="containerV" if={menu=='transaction'} style="margin-top: 10vh;">
    <transactions-list></transactions-list>
  </div>

  <script>
    this.resultEmail = ""
    this.modeUserResume = true
    this.modeUserEdition = false
    this.modeSetting = false
    this.mailsend = false
    this.payment_in_progress = false
    this.consultTransactionBoolean = false
    this.emailtext = "Renvoyer un email"
    this.menu = 'edit'
    this.profil = {
      credentials : {
        email: '',
      }
    }

    deconnexion(e) {
      RiotControl.trigger('deconnexion');
    }

    changeEmailInput(e) {
      this.profil.credentials.email = e.currentTarget.value;
    }

    changeJobInput(e) {
      this.profil.job = e.currentTarget.value;
    }

    changeSocietyInput(e) {
      this.profil.society = e.currentTarget.value;
    }

    changeNameInput(e) {
      this.profil.name = e.currentTarget.value;
    }

    updateUser(e) {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
      if (this.profil.credentials.email.match(regex)) {
        if (this.profil.credentials.email != this.refs.email.value) {
          RiotControl.trigger('update_user', {
            user: this.profil,
            mailChange: true
          });
        } else {
          RiotControl.trigger('update_user', {
            user: this.profil,
            mailChange: false
          });
        }
      } else {
        this.result = false;
        this.resultEmail = "L'email n'est pas au bond format";
      }
    }

    sendbackmail(e) {
      RiotControl.trigger('send_back_email', {user: this.profil})
    }
    
    RiotControl.on('email_send', function () {
      this.mailsend = true
      this.update()
    }.bind(this));

    RiotControl.on('google_user', function () {
      this.result = false;
      this.resultEmail = "vous ne pouvez pas modifier votre email en tant q'utilisateur google";
      this.update();
    }.bind(this));

    RiotControl.on('bad_format_job', function () {
      this.result = false;
      this.resultJob = "Le job n'est pas au bon format";
      this.update();
    }.bind(this));

    RiotControl.on('bad_format_name', function () {
      this.result = false;
      this.resultName = "Le job n'est pas au bon format";
      this.update();
    }.bind(this));

    RiotControl.on('bad_format_society', function () {
      this.result = false;
      this.resultSociety = "La societe n'est pas au bon format";
      this.update();
    }.bind(this));

    this.userFromStorage = function(profil){
      profil? this.profil = profil:  this.profil = { credentials : { email: ''}}
      console.log(this.profil)
      this.update()
    }.bind(this);

     this.profilMenuChanged = function (menu) {
      this.menu = menu;
      this.update();
    }.bind(this);

    this.backgroundActive = function ( active) {
      if(active == this.menu ) {
        return {"background-color": "rgb(104,175,212)"}
      }
        return {"background-color": "rgb(124,195,232)"}
    }

    this.on('mount', function () {
      console.log()
      RiotControl.on('user_from_storage', this.userFromStorage);
      RiotControl.on('profil_menu_changed', this.profilMenuChanged);
      RiotControl.trigger('get_user_from_storage')
    }.bind(this))

    this.on('unmount', function () {
      RiotControl.off('profil_menu_changed', this.profilMenuChanged);
      RiotControl.off('user_from_storage', this.profilMenuChanged);
    })


  </script>

  <style scoped="scoped">
    .arrow {
      position: absolute;
      bottom: 0;
    }
    .title-profil {
      color: rgb(33,151,242);
    }
    .navBarTop {
      display: flex;
      flex: 0.25;
      color: white;
      font-size:0.75em;
    }
    .containerNavBarTop {
      justify-content: space-around; 
      height: 10vh;
      position: fixed;
      width: 95%;
    }
    .containerEdit {
      margin-top: 10vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      flex: 1;
    }
    .containerInformation {
      width: 90%;
      background-color: white;
      margin: 2vh;
      padding: 2vh;
    }
    .containerBtn {
      padding: 4vh;
    }
    .containerValidate {

    }
    #bad-mail {
      color: red!important;
    }
    #containerLoaderDiv {
      background-color: rgba(200,200,200,0.6);
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

    .title-number {
      font-size: 30px;
      text-align: center;
    }

    .center-left-top {
      text-align: left;
      width: 30%;
    }
    .center-right-top {
      display: flex;
      justify-content: space-around;
      width: 60%;
    }
    #good-result {
      color: green;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
      padding-top: 4%;
    }
    #good-result-global {
      color: #3CB371;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
      flex-grow: 0.5;
    }

    #bad-result {
      color: red;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
    }

    #bad-result-global {
      display: none;
    }
    /* couleur de selection */
    .selectedMenu {
      background-color: rgb(213,218,224);
      /*rgb(124,195,232);*/
    }
    .sub-title {
      text-align: center;
      margin-top: 0;
    }

    .inligne--scroll {
      display: inligne--scroll;
    }
    h3 {
      text-align: center;
      font-family: 'Raleway', sans-serif;
    }

  </style>

</profil>
