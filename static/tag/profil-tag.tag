<profil-tag>
  <div>
    <div class="center-top">
      <p> La partie profil est actuellement en cours de dev <p>
      <form> 
        <input class="change-mail"value="{profil.email}" name="email"/>
        <div id={ result? 'good-result' : 'bad-result' }> {resultEmail}<div>
      </form>
      <div class="inligne-box">
        <button class="mail-btn"  onclick = {changeEmail} type="button">Modifier</button>
        <button class="dec-btn"  onclick = {deconnexion} type="button">Déconnexion</button>
      </div>
    </div>
  <div>
  <style scoped>
    #bad-result{
      color: red;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
      padding-top: 4%;
    }

    #good-result{
      color: green;
      font-size: 18px;
      font-family: 'Raleway', sans-serif;
      padding-top: 4%;
    }
  .change-mail {
    background-color: inherit !important;
    border-bottom: 1px solid #3498db !important;
    border: none;
    color: #3498db;
    text-align:center;
  }
    .center-top {
      margin-top: 20%!important;
      text-align:center;
    }
    .mail-btn {
      color: #ffffff;
      background-color: green;
      border: none;
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
      max-width: 25%;
      margin-top: 10%;  
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
  </style>
  <script>
    this.resultEmail = ""
    deconnexion(e){
      RiotControl.trigger('deconnexion');
    }

    this.email.addEventListener('change',function(e){
        this.profil.email =e.currentTarget.value;
        console.log( this.profil.email);
    }.bind(this));

    changeEmail(e){
       //console.log(this.profil.email)
       //regex a revoir
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
      if(this.profil.email.match(regex)){
        if(this.profil.email != this.email ){
          RiotControl.trigger('change_email',this.profil.email);
          RiotControl.on('email_already_exist', function(){
            console.log("email existe");
            this.result = false
              this.resultEmail = "L'email choisi exsite déjà"
          }.bind(this));
        }
      }
    }

    RiotControl.on('profil_loaded', function(data){
      this.result = true;
      this.resultEmail = "L'email a bien été modifié"
      this.profil = data.user
      this.email =  data.user.email
      this.update();
      this.resultEmail = "";
    }.bind(this))

    this.on('mount', function () {
      RiotControl.trigger('show_profil');
    }.bind(this))
  </script>
</profil-tag>
