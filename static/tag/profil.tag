<profil class="containerH" style="flex-grow:1;flex-wrap:nowrap; flex-grow: 1;">

    <div class="containerV" style="flex-basis: 70px; background-color: rgb(9,245,185);">
      <div class=" containerV" style="flex-basis:400px; background-color: rgb(9,245,185);flex-grow:0;">
        <div onclick={goUtilisation} class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
          <img src="./image/Graphe_2.svg" style="margin-bottom: 10px;" height="40px" width="40px">
          <p style="color:white;font-size:12px">Conso</p>
        </div>
        <div onclick={goUserEdition} class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
          <img src="./image/Autres.svg"  style="margin-bottom: 10px;"  height="40px"  width="40px">
          <p style="color:white;font-size:12px">Edition</p>
        </div>
        <div onclick={goSetting} class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
          <img src="./image/Roulette_bus.svg"  style="margin-bottom: 10px;"  height="40px"  width="40px">
          <p style="color:white;font-size:12px">Paramêtres</p>
        </div>
      </div>
    </div>


    <div class="containerV" if={modeUserResume} style="background-color: rgb(238,242,249); flex-grow: 1;">
        <graph-of-use-workspace></graph-of-use-workspace>
    </div>

      <div if={modeUserEdition} class="containerH" style="background-color:rgb(238, 242, 249);flex-grow: 1;justify-content: center; align-items: center;">
          <div class="containerV" style="justify-content:center;flex-basis: 600pt;">
            <div style="flex-basis:300pt;box-shadow: 0px 0px 5px rgba(134,134,134,0.5); background-color: rgb(250,250,250); padding: 5%;  border-radius: 5px;">
              <div class="containerV" style="flex-grow: 1;padding: 3%;">
                <h3 style="color:rgb(120,120,120)">{profil.name}</h3>
              </div>
              <div class="containerV">
                <label class="label-form">Mon email</label>
                <input class="change-mail" value="{profil.credentials.email}"  ref="email" onchange={changeEmailInput}/>
                <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultEmail}</div>
              </div>
              <!--  <label class="label-form">Name</label>
              <input class="change-mail" value="{profil.name}" name="name" onchange={changeNameInput}/>  -->
              <!--  <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultName}</div>  -->
              <div class="containerV">
                <label class="label-form" >Mon post actuel</label>
                <input class="change-mail" value="{profil.society}" placeholder="ajouter votre societé" name="society" onchange={changeSocietyInput}/>
                <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultJob}</div>
              </div>
              <div class="containerV">
                <label class="label-form">Ma société</label>
                <input class="change-mail" value="{profil.job}" placeholder="ajouter votre job"  name="job" onchange={changeJobInput}/>
                <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultSociety} </div>
              </div>
            </div>
            <div class="containerV" style=" justify-content: center; align-items: center;/* flex-grow: 1; */flex-basis: 105pt;">
              <div id={result? 'good-result-global' : 'bad-result-global' }>{resultGlobal} </div>
              <button class="mail-btn"  onclick = {updateUser} type="button" if = {googleId == null || googleId == 'undefined'}>Valider modification</button>
            </div>
          </div>
      </div>

        <div class="containerV" if={modeSetting} style="flex-grow: 1;background-color: rgb(238, 242, 249);">
        <div class="containerV" style="flex-grow:1;justify-content:center;align-items: center;">
        <h3 style="color: rgb(120,120,120);"> Nous esperons que votre expérience sur cet outil était satisfaisante ? à bientôt.</h3>
        <button class="dec-btn"  onclick = {deconnexion} type="button">Déconnexion</button>
      </div>

    </div>
  </div>
  <style scoped>

  .label-form{
    display: flex;
    margin-bottom: 1em;
    margin-top: 1em;
    color: rgb(120,120,120);
    align-self: center;
  }
  .title-number {
    font-size: 30px;
    text-align: center
  }


    .center-left-top{
      text-align:left;
      width: 30%;
    }
  .center-right-top{
    display: flex;
    justify-content: space-around;
    width: 60%;
  }
  #good-result{
    color: green;
    font-size: 18px;
    font-family: 'Raleway', sans-serif;
    padding-top: 4%;
  }
  #good-result-global{
    color: #3CB371;
    font-size: 18px;
    font-family: 'Raleway', sans-serif;
    flex-grow: 0.5;
  }

  #bad-result{
    color: red;
    font-size: 18px;
    font-family: 'Raleway', sans-serif;
    padding-top: 4%;
  }

  #bad-result-global{
    display: none
  }



  .sub-title {
    text-align:center ;
    margin-top: 0%;
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
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
      max-width: 25%;
      margin-top: 10%;
    }

    .inligne-box {
      display:inligne-box;
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
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
}
  </style>

  <script>
    this.resultEmail = ""
    this.googleId = localStorage.googleid
    this.modeUserResume =  true
    this.modeUserEdition = false
    this.modeSetting = false

    goUtilisation(e) {
      console.log(this.tags["graph-of-use-workspace"])
      if(this.tags["graph-of-use-workspace"] == null){
        RiotControl.trigger('load_profil');
      }
      this.modeUserResume =  true
      this.modeUserEdition = false
      this.modeSetting = false
      //console.log(this.workspace._id.$oid) RiotControl.trigger('load_all_profil_by_workspace', {_id: this.workspace._id.$oid})
    }.bind(this)

    goUserEdition(e) {
      this.modeUserResume =  false
      this.modeUserEdition = true
      this.modeSetting = false
    }.bind(this)

    goSetting(e) {
      this.modeUserResume =  false
      this.modeUserEdition = false
      this.modeSetting = true
    }.bind(this)


    deconnexion(e){
      RiotControl.trigger('deconnexion');
    }


    changeEmailInput(e){
        this.profil.credentials.email = e.currentTarget.value;
        console.log(this.profil.credentials.email);
    }

    changeJobInput(e){
        this.profil.job = e.currentTarget.value;
        console.log( this.profil.job);
    }
    changeSocietyInput(e){
        this.profil.society = e.currentTarget.value;
        console.log( this.profil.society);
    }
    changeNameInput(e){
        this.profil.name = e.currentTarget.value;
        console.log(this.profil.name);
    }

    updateUser(e){
      console.log(this.refs.email.value, this.profil.credentials.email)
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
      if(this.profil.credentials.email.match(regex)){
        if(this.profil.credentials.email != this.refs.email.value){
          RiotControl.trigger('update_user', {user: this.profil, mailChange: true});
        }else{
          RiotControl.trigger('update_user', {user: this.profil, mailChange: false});
        }
      }else{
        this.result = false;
        this.resultEmail = "L'email n'est pas au bond format";
      }
    }

    RiotControl.on('email_already_use', function(){
          this.result = false;
          this.resultEmail = "L'email choisi exsite déjà";
          this.update();
    }.bind(this));

     RiotControl.on('bad_format_email', function(){
          this.result = false;
          this.resultEmail = "L'email n'est pas au bond format";
          this.update();
    }.bind(this));

    RiotControl.on('google_user', function(){
          this.result = false;
          this.resultEmail = "vous ne pouvez pas modifier votre email en tant q'utilisateur google";
          this.update();
    }.bind(this));

    RiotControl.on('bad_format_job', function(){
          this.result = false;
          this.resultJob = "Le job n'est pas au bon format";
          this.update();
    }.bind(this));

    RiotControl.on('bad_format_name', function(){
          this.result = false;
          this.resultName= "Le job n'est pas au bon format";
          this.update();
    }.bind(this));

    RiotControl.on('bad_format_society', function(){
          this.result = false;
          this.resultSociety= "La societe n'est pas au bon format";
          this.update();
    }.bind(this));

    RiotControl.on('update_profil_done', function(){
      this.result = true;
      this.resultGlobal = "Votre profil à bien était mis à jour ";
      setTimeout(function(){
        console.log("SET TIME OUT")
         this.resultGlobal = ""
         this.update()
      }.bind(this), 2000);
      this.update();
    }.bind(this))

    RiotControl.on('profil_loaded', function(data){
      console.log("profil loaded", data)
      this.profil = data.user;
      this.update()
    }.bind(this))

    this.on('mount', function () {
      RiotControl.trigger('load_profil');
      this.googleId = localStorage.googleid
    })
  </script>
</profil>
