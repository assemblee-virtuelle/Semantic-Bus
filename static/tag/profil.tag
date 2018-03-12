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
       <a href="#profil//payement" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/credit_card.png" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Credits</p>
      </a>
      <a href="#profil//setting" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/Roulette_bus.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Paramêtres</p>
      </a>
    </div>
  </div>

  <div class="containerV" if={menu=='running'} style="background-color: rgb(238,242,249); flex-grow: 1;">
    <graph-of-use-workspace></graph-of-use-workspace>
  </div>

  <div if={menu=='edit'} class="containerH" style="background-color:rgb(238, 242, 249);flex-grow: 1;justify-content: center; align-items: center;">
    <div class="containerV" style="flex-grow:0.25; margin-top:2em">
      <div style="flex-basis:300pt; background-color:white; padding: 5%;  border-radius: 5px;">
        
        <div class="containerV" style="flex-grow: 1;background-color: rgb(250,250,250);"  >
          <h3 style="color:rgb(33,151,242); font-family: 'Open Sans', sans-serif;">{profil.name}</h3>
        </div>

        <div class="containerV" >
          <label class="label-form">Email</label>
          <!--  <input class="field" value="{profil.credentials.email}" ref="email" readOnly onchange={changeEmailInput}/>  -->
          <input class="field" value="{profil.credentials.email}" ref="email" readOnly/>
          <p style="color:rgba(0,0,0,0.5);text-align:center"> L'email ne peut être modifier pour le moment </p>
        </div>

        <div class="containerV">
          <label class="label-form">Société</label>
          <input class="field" value="{profil.job}" placeholder="ajouter votre job" name="job" onchange={changeJobInput}/>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultSociety} </div>
        </div>

        <div class="containerV">
          <label class="label-form">Post actuel</label>
          <input class="field" value="{profil.society}" placeholder="ajouter votre societé" name="society" onchange={changeSocietyInput}/>
          <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultJob}</div>
        </div>
      </div>

      <div class="containerV" if={!profil.active} style=" justify-content: center; align-items: center;/* flex-grow: 1; */flex-basis: 105pt;">
        <div if={!mailsend}>
          <div>Vous n'avez pas valider votre email ( consulter votre mail )</div>
          <button style="padding: 0.6em;
                      border-radius: 25px;
                      background-color:rgb(41,177,238);
                      color: white;
                      font-size: 20px;
                      margin-top: 20px;
                      text-align: center;
                      border: none;" onclick={sendbackmail} type="button">{emailtext}</button>
        </div>
        <div if={mailsend}>
          <div>Un email à été envoyé, verifier votre boite mail </div>
        </div>
      </div>
      <div class="containerV" style=" justify-content: center; align-items: center;/* flex-grow: 1; */flex-basis: 105pt;">
        <div id={result? 'good-result-global' : 'bad-result-global' }>{resultGlobal}
        </div>
         <button style="padding: 0.6em;
                      border-radius: 25px;
                      background-color:rgb(41,177,238);
                      color: white;
                      font-size: 20px;
                      margin-top: 20px;
                      text-align: center;
                      border: none;" onclick={updateUser} type="button" if={googleId ==null || googleId=='undefined' }>Valider modification</button>
      </div>
    </div>
  </div>

  <div class="containerV" if={menu=='setting'} style="flex-grow: 1;background-color:rgb(238, 242, 249);">
    <div class="containerV" style="flex-grow:1;justify-content:center;align-items: center;">
      <span class="title-profil">
        Nous esperons que votre expérience sur cet outil était satisfaisante ? à bientôt.</span>
        <button style="padding: 0.6em;
                      border-radius: 25px;
                      background-color:rgb(41,177,238);
                      color: white;
                      font-size: 20px;
                      margin-top: 20px;
                      text-align: center;
                      border: none;" onclick={deconnexion} type="button">Déconnexion</button>
    </div>
  </div>

  <div class="containerV" if={menu=='payement'} style="flex-grow: 1;background-color: white;">
    <div class="containerV" style="flex-grow: 1;background-color: white;">
      <stripe2-tag></stripe2-tag>
    </div>
  </div>
  <div if={menu=='transaction'} style="flex-grow: 1;background-color: rgb(238, 242, 249);">
    <transactions-list></transactions-list>
    <div class="containerV" style="flex-grow:1;justify-content:center;align-items:center">
      <a href="#profil//running" class="commandButtonImage containerV" style=
          "border-radius: 25px;
          padding: 0.6em;
          background-color: rgb(9,245,185);
          color: white;
          font-size: 20px;
          margin-top: 20px;
          text-align: center;"> 
          Retour </a>
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
    console.log("IN this.isIn3DSecurePayement",location.search.split('client_secret='))
    this.addCredit = false
     if(location.search.split('client_secret=').length > 1){
      var client_secret = location.search.split('client_secret=')[1].split('&livemode')[0]
      var source = location.search.split('source=')[1]
      var amount = location.search.split('amount=')[1].split('&client_secret')[0]
      RiotControl.trigger('stripe_payment',{ source: source, amount: amount, secret: client_secret});
    }
  }

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
  sendbackmail(e){
     RiotControl.trigger('send_back_email', {user: this.profil})
  }
  RiotControl.on('email_send', function(){
      this.mailsend = true
      this.update()
  }.bind(this));

  RiotControl.on('payment_in_progress',function(){
    console.log("payment in progress")
    this.payment_in_progress = true
    this.update()
  }.bind(this));

  RiotControl.on('payment_done',function(){
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
<style scoped>

  .field {
    background-color: #f4f5f7;
    border-radius: 3rem;
    padding: 10px 20px 11px;
    color: rgba(0,0,0,0.6);
  }

  .field:focus {
    background-color:rgb(33,150,243);
    color:white
  }

  .title-profil {
    color:rgb(33,151,242)
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
