<profil class="containerU" style="justify-content: center;flex-grow:1;flex-wrap:nowrap;">

  <!-- Chargement paiement -->
  <div id="containerLoaderDiv" if={payment_in_progress == true} class="containerV" style="justify-content:center">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText" class="containerV">
        <span>
          Paiement en cours
        </span>
      </h1>
    </div>
  </div>
  <!-- Menu utilisateur -->
  <div class="containerU" style="height:80px;background-color: rgb(124,195,232);flex-shrink:0;">
    <!-- ID editer-->
    <div class=" containerH" style="justify-content: space-around;flex-grow:1;flex-wrap:wrap;">
      <a href="#profil//edit" class="commandButtonImage containerU" style="flex-basis:30px;position:relative;">
        <img src="./image/menu/id-card.png" style="" height="40px" width="40px">
        <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Editer</p>
        <!--condition -->
        <div if={menu=='edit'} class="containerH" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
          <div class="containerV" style="justify-content:flex-end;">
            <div class="arrow-up"></div>
          </div>
        </div>
      </a>
      <!-- Consommation-->
      <a href="#profil//running" class="commandButtonImage containerU" style="flex-basis:30px;position:relative;">
        <img src="./image/menu/chart-.png" style="" height="40px" width="40px">
        <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Consommation</p>
        <!--condition -->
        <div if={menu=='running'} class="containerH" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
          <div class="containerV" style="justify-content:flex-end;">
            <div class="arrow-up"></div>
          </div>
        </div>
      </a>
      <!-- crédit -->
      <a href="#profil//payement" class="commandButtonImage {selectedMenu:isScrennInHistory('#profil//payement')} containerU" style="flex-basis:30px;position:relative;">
        <img src="./image/menu/credit-card.png" style="" height="40px" width="40px">
        <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Crédits</p>
        <!--condition -->
        <div if={menu=='payement'} class="containerH" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
          <div class="containerV" style="justify-content:flex-end;">
            <div class="arrow-up"></div>
            <!--condition 2 menu=='transaction'-->
          </div>
        </div>
      </a>
      <!-- Paramètres <a href="#profil//setting" class="commandButtonImage containerU" style="flex-basis:30px"> <img src="./image/menu/conf.png" style="" height="40px" width="40px"> <p style="text-align:center;padding-top: 5px;font-family: 'Open Sans',
      sans-serif;color:white;font-size:10px">Paramètres</p> </a>-->
      <!-- Déconnexion -->
      <a onclick={deconnexion} class="commandButtonImage containerU" style="flex-basis:30px;position:relative;">
        <img src="./image/menu/log-out.png" style="" height="40px" width="40px">
        <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px;">Déconnexion</p>
        <!--condition -->
        <div if={} class="containerH" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
          <div class="containerV" style="justify-content:flex-end;">
            <div class="arrow-up"></div>
          </div>
        </div>
      </a>
    </div>
  </div>
  <!-- Graphique consommation -->
  <div class="containerV" if={menu=='running'} style="height: 300px;background-color: rgb(238,242,249); flex-grow: 1;">
    <graph-of-use-workspace></graph-of-use-workspace>
  </div>
  <!-- Page Editer -->
  <div class="containerV" if={menu=='edit'} style="height: 300px;align-items: center;background-color:rgb(238, 242, 249);flex-grow: 1;">
      <div class="containerU box" style="margin-bottom:20px;margin-top:20px;width:90%">
    <!-- Formulaire utilisateur -->

        <!-- Nom d'utilisateur -->
        <h3 style="color:rgb(33,151,242); font-family: 'Open Sans', sans-serif;">{profil.name}</h3>
        <!-- Email -->
        <label>Email</label>
        <input value="{profil.credentials.email}" ref="email" readonly="readOnly">
        <!-- info mail -->
    <label>L'email ne peut être modifier pour le moment</label>
        <div if={!profil.active}>
          <div if={!mailsend}>
            <div id="bad-result">Vous n'avez pas valider votre email (consulter vos mails)</div>
          </div>
        </div>
        <!--boutons renvoyer mail -->
        <div class="containerH" style="justify-content:center;">
          <button class="btn" onclick={sendbackmail} type="button">{emailtext}</button>
        </div>

        <!-- info mail -->
        <div class="containerV" if={mailsend} style="justify-content: center; align-items: center;/* flex-grow: 1; */">
          <div>Un email à été envoyé, verifier votre boite mail.</div>
        </div>

        <!-- Société -->
        <label>Société</label>
        <input value="{profil.society}" placeholder="saisissez votre société" name="society" onchange={changeSocietyInput}>

        <!-- Emploi -->
        <label>Statut</label>
        <input value="{profil.job}" placeholder="saisissez votre statut" name="job" onchange={changeJobInput}>

        <div class="containerV" style="justify-content: center; align-items: center;/* flex-grow: 1; */">
          <div id={result? 'good-result-global' : 'bad-result-global' }>{resultGlobal}
          </div>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultSociety}
          </div>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultJob}
          </div>
        </div>
        <!-- Bouton valider -->
        <div class="containerU" style="padding-top: 20px;justify-content: center; align-items: center;">
          <button class="btn" onclick={updateUser} type="button" if={googleId ==null || googleId=='undefined' }>Valider</button>
        </div>
      </div>
    </div>


<!-- Paramétre -->
<div class="containerV" if={menu=='setting'} style="height: 300px;flex-grow: 1;background-color:rgb(238, 242, 249);">
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
<div class="containerV" if={menu=='payement'} style="height: 300px;flex-grow: 1;background-color: rgb(238, 242, 249);">
<div class="containerV" style="flex-grow: 1;background-color: rgb(238, 242, 249);">
  <stripe2-tag></stripe2-tag>
</div>
</div>
<div if={menu=='transaction'} style="flex-grow: 1;background-color: rgb(238, 242, 249);">
<transactions-list></transactions-list>
<div class="containerV" style="flex-grow:1;justify-content:center;align-items:center">
  <a
    href="#profil//running"
    class="commandButtonImage containerV"
    style="border-radius: 25px;
          padding: 0.6em;
          background-color: rgb(9,245,185);
          color: white;
          font-size: 20px;
          margin-top: 20px;
          text-align: center;">
    Retour
  </a>
</div>
</div>

<script>
this.resultEmail = ""
this.googleId = localStorage.googleid
this.modeUserResume = true
this.modeUserEdition = false
this.modeSetting = false
this.mailsend = false
this.payment_in_progress = false
this.consultTransactionBoolean = false
this.emailtext = "Renvoyer un email"
this.menu = 'running'

this.isIn3DSecurePayement = function () {
  console.log("IN this.isIn3DSecurePayement", location.search.split('client_secret='))
  this.addCredit = false
  if (location.search.split('client_secret=').length > 1) {
    var client_secret = location.search.split('client_secret=')[1].split('&livemode')[0]
    var source = location.search.split('source=')[1]
    var amount = location.search.split('amount=')[1].split('&client_secret')[0]
    RiotControl.trigger('stripe_payment', {
      source: source,
      amount: amount,
      secret: client_secret
    });
  }
}
/*déconnexion*/
deconnexion(e) {
  RiotControl.trigger('deconnexion');
}

changeEmailInput(e) {
  this.profil.credentials.email = e.currentTarget.value;
  console.log(this.profil.credentials.email);
}
changeJobInput(e) {
  this.profil.job = e.currentTarget.value;
  console.log(this.profil.job);
}
changeSocietyInput(e) {
  this.profil.society = e.currentTarget.value;
  console.log(this.profil.society);
}
changeNameInput(e) {
  this.profil.name = e.currentTarget.value;
  console.log(this.profil.name);
}
updateUser(e) {
  console.log(this.refs.email.value, this.profil.credentials.email)
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

RiotControl.on('payment_in_progress', function () {
  console.log("payment in progress")
  this.payment_in_progress = true
  this.update()
}.bind(this));

RiotControl.on('payment_done', function () {
  this.payment_in_progress = false
  this.consultTransactionBoolean = false
  this.update()
}.bind(this));

RiotControl.on('email_already_use', function () {
  this.result = false;
  this.resultEmail = "L'email choisi exsite déjà";
  this.update();
}.bind(this));

RiotControl.on('bad_format_email', function () {
  this.result = false;
  this.resultEmail = "L'email n'est pas au bond format";
  this.update();
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

RiotControl.on('update_profil_done', function () {
  this.result = true;
  this.resultGlobal = "Votre profil à bien était mis à jour";
  setTimeout(function () {
    console.log("SET TIME OUT")
    this.resultGlobal = ""
    this.update()
  }.bind(this), 2000);
  this.update();
}.bind(this));

RiotControl.on('profil_loaded', function (data) {
  this.profil = data;
  this.update()
}.bind(this))

this.profilMenuChanged = function (menu) {
  this.menu = menu;
  this.update();
}.bind(this);

this.on('mount', function () {
  this.menu = 'running'
  console.log("MENU", this.menu)
  this.isIn3DSecurePayement()
  RiotControl.on('profil_menu_changed', this.profilMenuChanged);
  RiotControl.trigger('load_profil');
  this.googleId = localStorage.googleid
})

this.on('unmount', function () {
  RiotControl.off('profil_menu_changed', this.profilMenuChanged);
})
</script>
<style scoped="scoped">
.title-profil {
  color: rgb(33,151,242);
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
  padding-top: 4%;
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

.inligne-box {
  display: inligne-box;
}
h3 {
  text-align: center;
  font-family: 'Raleway', sans-serif;
}

/*div.tooltip {
  position: absolute;
  text-align: left;
  width: 200px;
  height: 70px;
  padding: 10px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0;
  border-radius: 8px;
  pointer-events: none;
}*/
</style>
</profil>
