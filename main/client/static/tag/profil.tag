<profil class="containerV">

  <ds-horizontal-nav
    items={JSON.stringify([
      {code: 'edit', url: '#profil//edit', image: './image/menu/id-card.png', label: 'Editer'},
      {code: 'running', url: '#profil//running', image: './image/menu/chart-.png', label: 'Consommation'},
      {code: 'payement', url: '#profil//payement', image: './image/menu/credit-card.png', label: 'Crédits'},
      {code: 'logout', image: './image/menu/log-out.png', label: 'Déconnexion'},
    ])}
    active={menu}
    onAction={this.onNavAction}
  ></ds-horizontal-nav>

  <!-- Graphique consommation -->
  <div class="containerV" if={menu=='running'} style="margin-top: 10vh;">
    <graph-of-use-workspace></graph-of-use-workspace>
  </div>
  <!-- Page Editer -->
  <div if={menu=='edit'} class="containerEdit">
    <div class="containerInformation">
      <ds-card>
        <ds-input-text
          label="Nom d'utilisateur"
          id="profil.name"
          x-value={parent.profil.name}
          onupdate={parent.changeNameInput}
        ></ds-input-text>

        <ds-input-text
          label="Email"
          id="profil.email"
          x-value={parent.profil.credentials.email}
          readonly={true}
        ></ds-input-text>

        <ds-input-text
          label="Société"
          id="profil.society"
          x-value={parent.profil.society}
          placeholder="saisissez votre société"
          onupdate={parent.changeSocietyInput}
        ></ds-input-text>

        <ds-input-text
          label="Statut"
          id="profil.job"
          x-value={parent.profil.job}
          placeholder="saisissez votre statut"
          onupdate={parent.changeJobInput}
        ></ds-input-text>

        <!-- info mail -->
        <div class="containerV" if={parent.mailsend} style="justify-content: center; align-items: center;/* flex-grow: 1; */">
          <div>Un email à été envoyé, verifier votre boite mail.</div>
        </div>

        <!--boutons renvoyer mail -->
        <div class="profile-information">
          ** L'email ne peut être modifier pour le moment veuillez recreer un compte et vous partager vos workflow en cas de changement

          <div if={!parent.profil.active}>
            <div if={!parent.mailsend} id="bad-mail">
              !!!! Vous n'avez pas valider votre email (consulter vos mails / spam ) Vous ne pourrez utiliser l'outils sans un mail confirmer !!!!
            </div>
            <div class="containerH" if={parent.profil.googleId == null || parent.profil.googleId=='undefined' } style="margin-top:20px;">
              <button class="button-profil" onclick={parent.sendbackmail} type="button">{parent.emailtext}</button>
            </div>
          </div>
        </div>
      </ds-card>
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
        onclick={logout}
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

    onNavAction(e) {
      if (e.data === 'logout') {
        this.logout()
      }
    }

    logout(e) {
      RiotControl.trigger('logout');
    }

    changeEmailInput(e) {
      this.profil.credentials.email = e.currentTarget.value;
    }

    changeJobInput(e) {
      this.profil.job = e.data.value;
    }

    changeSocietyInput(e) {
      this.profil.society = e.data.value;
    }

    changeNameInput(e) {
      this.profil.name = e.data.value;
    }

    updateUser(e) {
      const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
      if (this.profil.credentials.email.match(regex)) {
        RiotControl.trigger('update_user', {
          user: this.profil,
          mailChange: false
        });
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
      width: 100%;
      box-sizing: border-box;
      padding: 15px;
    }

    ds-input-text, ds-input-integer {
      display: block;
      margin-bottom: 15px;
    }

    .containerBtn {
      padding: 4vh;
    }
    .containerValidate {

    }
    .profile-information {
      padding: 20px;
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
