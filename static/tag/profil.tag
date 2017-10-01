<profil>
  <div class="containerH" style="flex-wrap:nowrap;flex-grow:1;">
    <div class="containerV" style="flex-basis:95px;">
        <div onclick={goUtilisation} class="commandButtonImage">
          <img src="./image/Pie-Chart-Graph-32.png" height="60px">
        </div>
        <div onclick={goUserEdition} class="commandButtonImage">
          <img src="./image/user-profile-edition.png" height="60px">
        </div>
        <div onclick={goSetting} class="commandButtonImage">
          <img src="./image/setting.png" height="60px">
        </div>
    </div>
    <div class="containerV"  style="flex-grow:1;">
      <div if ={modeUserResume}>
        <graph-of-use-workspace></graph-of-use-workspace>
      </div>
      <div if={modeUserEdition} style="height: 95vh;
width: 100%;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;">
        <h4 style="font-size:20px">Modification de votre profil</h4>
          <form style="height: 61vh;width: 60%; background-color: rgb(250,250,250); padding: 2%; border-radius: 5px;">
            <label class="label-form">Email</label>
            <input class="change-mail" value="{profil.credentials.email}"    name="email" onchange={changeEmailInput}/>
            <!--  <div id={ result? 'good-result' : 'bad-result' }>{resultEmail}</div>  -->
            <label class="label-form">Name</label>
            <input class="change-mail" value="{profil.name}" name="name" onchange={changeNameInput}/>
            <!--  <div id={ result? 'good-result' : 'bad-result' }>{resultEmail}</div>  -->
            <label class="label-form" >Job</label>
            <input class="change-mail" value="{profil.society}" placeholder="ajouter votre societé" name="society" onchange={changeSocietyInput}/>
            <!--  <div id={ result? 'good-result' : 'bad-result' }>{resultEmail}</div>  -->
            <label class="label-form">Society</label>
            <input class="change-mail" value="{profil.job}" placeholder="ajouter votre job"  name="job" onchange={changeJobInput}/>
            <!--  <div id={ result? 'good-result' : 'bad-result' }>{resultEmail} </div>  -->
        </form> 
          <div style="text-align: center;">
            <button class="mail-btn"  onclick = {changeEmail} type="button" if = {googleId == null || googleId == 'undefined'}>Valider modification</button>  
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

  .container-top{
    display:flex;
    background-color: rgb(250,250,250);
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
        console.log( this.profil.credentials.email);
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

    changeEmail(e){
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
      if(this.profil.credentials.email.match(regex)){
        if(this.profil.credentials.email != this.email){
          RiotControl.trigger('change_email', {user: this.profil});
          RiotControl.on('email_already_exist', function(){
            this.result = false;
            this.resultEmail = "L'email choisi exsite déjà";
            this.update();
          }.bind(this));
        }
      }
    }


    RiotControl.on('email_change', function(data){
      this.result = true;
      this.resultEmail = "L'email a bien été modifié";
      this.profil = data.user;
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
