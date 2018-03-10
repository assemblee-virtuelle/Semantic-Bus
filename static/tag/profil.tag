<profil class="containerH" style="flex-grow:1;flex-wrap:nowrap;">
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
  <div class="containerV" style="flex-basis: 70px; background-color: rgb(9,245,185);flex-shrink:0;">
    <div class=" containerV" style="flex-basis:400px; background-color: rgb(9,245,185);flex-grow:0;">
      <a href="#profil//running" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/Stats.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Conso</p>
      </a>
      <a href="#profil//edit" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/Autres.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Edition</p>
      </a>
      <a href="#profil//setting" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/Roulette_bus.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Paramêtres</p>
      </a>
       <a href="#profil//payement" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/credit_card.png" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Credits</p>
      </a>
    </div>
  </div>

  <div class="containerV" if={menu=='running'} style="background-color: rgb(238,242,249); flex-grow: 1;">
    <graph-of-use-workspace></graph-of-use-workspace>
  </div>

  <div if={menu=='edit'} class="containerH" style="background-color:rgb(238, 242, 249);flex-grow: 1;justify-content: center; align-items: center;">
    <div class="containerV" style="justify-content:center;flex-basis: 600pt;">
      <div style="flex-basis:300pt;box-shadow: 0px 0px 5px rgba(134,134,134,0.5); background-color: rgb(250,250,250); padding: 5%;  border-radius: 5px;">
        <div class="containerV" style="flex-grow: 1;padding: 3%;">
          <h3 style="color:rgb(120,120,120)">{profil.name}</h3>
        </div>
        <div class="containerV">
          <label class="label-forrefreshErrorsTablem">Mon email</label>
          <input class="change-mail" value="{profil.credentials.email}" ref="email" onchange={changeEmailInput}/>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultEmail}</div>
        </div>
        <!--  <label class="label-form">Name</label>
              <input class="change-mail" value="{profil.name}" name="name" onchange={changeNameInput}/>  -->
        <!--  <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultName}</div>  -->
        <div class="containerV">
          <label class="label-form">Mon post actuel</label>
          <input class="change-mail" value="{profil.society}" placeholder="ajouter votre societé" name="society" onchange={changeSocietyInput}/>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultJob}</div>
        </div>
        <div class="containerV">
          <label class="label-form">Ma société</label>
          <input class="change-mail" value="{profil.job}" placeholder="ajouter votre job" name="job" onchange={changeJobInput}/>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultSociety}
          </div>
        </div>
      </div>
      <div class="containerV" if={!profil.active} style=" justify-content: center; align-items: center;/* flex-grow: 1; */flex-basis: 105pt;">
        <div if={!mailsend}>
          <div>Vous n'avez pas valider votre email ( consulter votre mail )</div>
          <button class="mail-btn" onclick={sendbackmail} type="button">{emailtext}</button>
        </div>
        <div if={mailsend}>
          <div>Un email à été envoyé, verifier votre boite mail </div>
        </div>
      </div>
      <div class="containerV" style=" justify-content: center; align-items: center;/* flex-grow: 1; */flex-basis: 105pt;">
        <div id={result? 'good-result-global' : 'bad-result-global' }>{resultGlobal}
        </div>
        <button class="mail-btn" onclick={updateUser} type="button" if={googleId ==null || googleId=='undefined' }>Valider modification</button>
      </div>
    </div>
  </div>

  <div class="containerV" if={menu=='setting'} style="flex-grow: 1;background-color: rgb(238, 242, 249);">
    <div class="containerV" style="flex-grow:1;justify-content:center;align-items: center;">
      <h3 style="color: rgb(120,120,120);">
        Nous esperons que votre expérience sur cet outil était satisfaisante ? à bientôt.</h3>
        <button class="dec-btn" onclick={deconnexion} type="button">Déconnexion</button>
    </div>
  </div>

  <div class="containerV" if={menu=='payement'} style="flex-grow: 1;background-color: rgb(238, 242, 249);">
    <div class="containerV" style="flex-grow: 1;background-color: rgb(238, 242, 249);">
      <stripe2-tag></stripe2-tag>
      <!--  <div class="containerV" style="flex-grow:1;justify-content:center;align-items:center">
        <a href="#profil//payement" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px" style="padding: 20px;
        border-radius: 10px;
        background-color: rgb(9,245,185);
        color: white;
        font-size: 20px;
        margin-top: 20px;
        text-align: center;">Retour</a>
      </div>  -->
    </div>
  <div if={menu=='transaction'} style="flex-grow: 1;background-color: rgb(238, 242, 249);">
    <transactions-list></transactions-list>
    <div class="containerV" style="flex-grow:1;justify-content:center;align-items:center">
      <a href="#profil//addcredit" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px" style="padding: 20px;
      border-radius: 10px;
      background-color: rgb(9,245,185);
      color: white;
      font-size: 20px;
      margin-top: 20px;
      text-align: center;"> Retour </a>
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
  
  this.isIn3DSecurePayement = function () {
    console.log("IN this.isIn3DSecurePayement",location.search.split('client_secret='))
    this.addCredit = false
     if(location.search.split('client_secret=').length > 1){
      var client_secret = location.search.split('client_secret=')[1].split('&livemode')[0]
      var source = location.search.split('source=')[1]
      var amount = location.search.split('amount=')[1].split('&client_secret')[0]
      RiotControl.trigger('stripe_payment',{ source: source, amount: amount, secret: client_secret});
    }
  }

  consultTransaction(){
    this.consultTransactionBoolean = true
    this.update()
  }

  deconnexion(e) {
    RiotControl.trigger('deconnexion');
  }
  addCreditButton(){
    console.log(this.addCredit)
    this.addCredit = true
    this.consultTransactionBoolean = false
    console.log(this.addCredit)
    this.update()
  }

  retourCreditButton(){
    console.log(this.addCredit)
    this.consultTransactionBoolean = false
    this.addCredit = false
    console.log(this.addCredit)
    this.update()
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

  sendbackmail(e){
     RiotControl.trigger('send_back_email', {user: this.profil})
  }

  RiotControl.on('email_send', function(){
      this.mailsend = true
      this.update()
  }.bind(this))

  RiotControl.on('payment_in_progress',function(){
    console.log("payment in progress")
    this.payment_in_progress = true
    this.update()
  }.bind(this))

  RiotControl.on('payment_done',function(){
    this.payment_in_progress = false
    this.consultTransactionBoolean = false
    this.update()
  }.bind(this))

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
  }.bind(this))

  RiotControl.on('profil_loaded', function (data) {
    console.log("profil loaded", data)
    this.profil = data;
    this.update()
  }.bind(this))

  this.profilMenuChanged = function (menu) {
    this.menu = menu;
    this.update();
  }.bind(this);

  this.on('mount', function () {
    this.isIn3DSecurePayement()
    this.consultCredit = false
    this.addCredit = false
    RiotControl.on('profil_menu_changed', this.profilMenuChanged);
    RiotControl.trigger('load_profil');
    this.googleId = localStorage.googleid
  })

  this.on('unmount', function () {
    RiotControl.off('profil_menu_changed', this.profilMenuChanged);
  })
</script>
<style scoped>

    #containerLoaderDiv {
      background-color: rgba(200,200,200,0.6);
      bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      position: absolute;
      z-index: 1;
      /*width: 100%;
      height: 125vh;
      position: absolute;
      z-index: 1;
      padding: 0;
      margin: 0;
      display: -webkit-box;
      display: -moz-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      align-items: center;
      justify-content: center;*/
    }


    #row {
      display: flex;
      flex-direction: column;
      align-items: center;

    }
  .credit-btn{
    color: #ffffff;
    background-color: rgb(33,150,243);
    border: none;
    padding: 10px;
    border-radius: 5px 5px 5px 5px;
    text-align: center;
    max-width: 40%;
    margin-top: 10%;
  }

  .transac-btn {
    color: #ffffff;
    background-color: rgb(9,245,185);
    border: none;
    padding: 10px;
    border-radius: 5px 5px 5px 5px;
    text-align: center;
    max-width: 40%;
    margin-top: 10%;
    margin-left: 10%;
  }
  .label-form {
    display: flex;
    margin-bottom: 1em;
    margin-top: 1em;
    color: rgb(120,120,120);
    align-self: center;
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

  .sub-title {
    text-align: center;
    margin-top: 0;
  }
  .change-mail {
    min-width: 80%;
    border-radius: 9px;
    box-shadow: none;
    border: 1px solid white;
    padding: 5px;
  }
  .mail-btn {
    padding: 10px;
    border-radius: 5px 5px 5px 5px;
    text-align: center;
    border: 1px solid #3498db;
    background: #3498db;
    color: white;
  }
  .dec-btn {
    color: #ffffff;
    background-color: #ff6666;
    border: none;
    padding: 10px;
    border-radius: 5px 5px 5px 5px;
    text-align: center;
    max-width: 25%;
    margin-top: 10%;
  }

  .inligne-box {
    display: inligne-box;
  }
  h3 {
    text-align: center;
    font-family: 'Raleway', sans-serif;
  }

  div.tooltip {
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
  }

</style>
</profil>
