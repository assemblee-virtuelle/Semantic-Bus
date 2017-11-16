<profil class="containerV containerV-scrollale" style="flex-grow:1">
   <div class="containerH" style="justify-content:left;flex-basis: 100%;">

    <div class="containerV" style="flex-basis: 5%; background-color: rgb(9,245,185);">
          <div class="containerV" style="flex-grow:1">
          <div onclick={goUtilisation} class="commandButtonImage">
            <img src="./image/Graphe_2.svg" height="40px" width="40px">
          </div>
          <div onclick={goUserEdition} class="commandButtonImage">
            <img src="./image/Autres.svg" height="40px"  width="40px">
          </div>
          <div onclick={goSetting} class="commandButtonImage">
            <img src="./image/Roulette_bus.svg" height="40px"  width="40px">
          </div>
      </div>
    </div>
   
    <div class="containerH"  if ={modeUserResume} style="flex-basis: 95%;">
        <!--  <graph-of-use-workspace></graph-of-use-workspace>  -->
    </div>

      <div if={modeUserEdition} class="containerV" style="flex-basis: 95%;justify-content: center; align-items: center;">
        <h4 style="font-size:20px">Modification de votre profil</h4>
          <form style="height: 61vh;width: 60%; background-color: rgb(250,250,250); padding: 2%; border-radius: 5px;">
            <label class="label-form">Email</label>
            <input class="change-mail" value="{profil.credentials.email}"  ref="email" onchange={changeEmailInput}/>
            <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultEmail}</div>
            <label class="label-form">Name</label>
            <input class="change-mail" value="{profil.name}" name="name" onchange={changeNameInput}/>
            <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultName}</div>
            <label class="label-form" >Job</label>
            <input class="change-mail" value="{profil.society}" placeholder="ajouter votre societé" name="society" onchange={changeSocietyInput}/>
            <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultJob}</div>
            <label class="label-form">Society</label>
            <input class="change-mail" value="{profil.job}" placeholder="ajouter votre job"  name="job" onchange={changeJobInput}/>
            <div if={!result} id={ result? 'good-result' : 'bad-result' }>{resultSociety} </div>
          </form> 
          <div id={result? 'good-result-global' : 'bad-result-global' }>{resultGlobal} </div>
          <div style="text-align: center;">
            <button class="mail-btn"  onclick = {updateUser} type="button" if = {googleId == null || googleId == 'undefined'}>Valider modification</button>  
          </div>
      </div>

      <div if={modeSetting} style="height: 95vh;">
        <h4>Paramètres</h4>
        <button class="dec-btn"  onclick = {deconnexion} type="button">Déconnexion</button>
      </div>

    </div>
  </div> 
  <style scoped>
  
  .label-form{
    width: 17%;
    display: block;
    margin-bottom: 1em;
    margin-top: 1em;
    color: black;
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
    color: green;
    font-size: 18px;
    font-family: 'Raleway', sans-serif;
    padding-top: 1%;
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
      margin-top: 10%;
      border: 1px solid #3498db;
      background: transparent;
      color: #3498db;
    }
    .dec-btn {
      color: #ffffff;
      background-color: red;
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
      this.resultGlobal = "le profil à était mis à jour";
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
