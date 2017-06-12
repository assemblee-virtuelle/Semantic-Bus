<login>
  <div class="Aligner" show={boole}>
    <form >
    <h1>Bienvenue sur le bus Semantic</h1>
      <div class="box">
        <input type="email" name="email"  placeholder="saisir email" class="email" />
        <input type="password" name="password" id="password" placeholder="saisir mot de passe" class="email" required />
        <div id="result">{resultConnexion}</div> 
        <a onclick = {hidePage} class="btn">Inscription</a> 

        <a onclick = {login} id="btn2">Connexion</a> <!-- End Btn2 -->
      </div> <!-- End Box -->  
      <p>mot de passe oublié? <u style="color:#f1c40f;">Clicker ici!</u></p>
    </form> 
  </div>

<div class="Aligner" show = {!boole}>
  <form>
    <h1>Inscrivez vous</h1>
      <div class="box">
        <input type="email" name="emailInscription"  placeholder="saisir email"  class="email" />
        <div id="result">{resultEmail}</div> 
        <input type="password" required name="passwordInscription" placeholder="saisir mot de passe"  class="email" />
        <input type="password" required name="confirmPasswordInscription" placeholder="confirmer mot de passe"  class="email" />
        <div id="result">{resultMdp}</div> 
         <!-- <input type="password" required name="passwordInscription" placeholder="confirmer mot de passe"  class="email" /> -->
        <button onclick={showPage} id="btn2">Retour</button> 
        <a onclick = {inscription} id="btn2">Inscription</a> 
      </div> 
  </form>
</div>

<style scoped>
  #result{
    color:red;
    font-size:12px;
    font-family: 'Raleway', sans-serif;
  }
  .Aligner {
  height:100%;
  width:100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

  p{
    font-size:12px;
    text-decoration: none;
    color:#ffffff;
    
  }

  h1{
    padding:5%;
    font-size:1.5em;
    color:white;
  }

  .box{
    background:white;
    width:300px;
    border-radius:6px;
    margin: 0 auto 0 auto;
    padding:10px 10px 80px 0px;
    border: #2980b9 4px solid; 
    
  }

  .email{
    background:#ecf0f1;
    border: #ccc 1px solid;
    border-bottom: #ccc 2px solid;
    padding: 8px;
    width:250px;
    color:#AAAAAA;
    margin-top:10px;
    font-size:1em;
    border-radius:4px;
  }

  .password{
    border-radius:4px;
    background:#ecf0f1;
    border: #ccc 1px solid;
    padding: 8px;
    width:250px;
    font-size:1em;
  }

  .btn{
    background:#2ecc71;
    width:125px;
    padding-top:5px;
    padding-bottom:5px;
    color:white;
    border-radius:4px;
    border: #27ae60 1px solid;
    
    margin-top:20px;
    margin-bottom:20px;
    float:left;
    margin-left:16px;
    font-weight:800;
    font-size:0.8em;
  }

  .btn:hover{
    background:#2CC06B; 
  }

  #btn2{
    float:left;
    background:#3498db;
    width:125px;  padding-top:5px;
    padding-bottom:5px;
    color:white;
    border-radius:4px;
    border: #2980b9 1px solid;
    
    margin-top:20px;
    margin-bottom:20px;
    margin-left:10px;
    font-weight:800;
    font-size:0.8em;
  }

  #btn2:hover{ 
  background:#3594D2; 
  }
  </style>

    <script>
  this.resultConnexion = "";
  this.resultEmail = "";
  this.resultMdp = "";
  this.user = {};
  this.newUser = {}
  this.boole = true;
  console.log(this.boole);
  Object.defineProperty(this, 'data', {
      set: function (data) {
      this.user =data;
      this.newUser = {}
      this.update();
    }.bind(this),
      get: function () {
      return this.user;
    }
  })

  this.email.addEventListener('change',function(e){
    this.user.email = e.currentTarget.value;
  }.bind(this));

  this.password.addEventListener('change',function(e){
    this.user.password = e.currentTarget.value;
  }.bind(this));


  this.emailInscription.addEventListener('change',function(e){
    this.resultEmail = ""
    this.newUser.emailInscription = e.currentTarget.value;
  }.bind(this));

  this.passwordInscription.addEventListener('change',function(e){
    this.newUser.passwordInscription = e.currentTarget.value;
  }.bind(this));

   this.confirmPasswordInscription.addEventListener('change',function(e){
    this.newUser.confirmPasswordInscription = e.currentTarget.value;
  }.bind(this));

  inscription(e){
    
     if((this.newUser.passwordInscription != "") && (this.newUser.confirmPasswordInscription != "") && (this.newUser.emailInscription != "")){
      var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
      if(this.newUser.emailInscription.match(reg) != null){
        //if(this.newUser.passwordInscription.split().length > 5){
          if((this.newUser.passwordInscription == this.newUser.confirmPasswordInscription) && (this.newUser.passwordInscription.split("").length > 5)){
            RiotControl.trigger('user_inscription', this.newUser);
            RiotControl.on('email_already_exist', function(){
              this.resultEmail = "L'email choisi exsite déjà"
            }.bind(this));
          }else{
              this.resultMdp = "mot de passe invalide"
          }
          //}
        }else{
          this.resultEmail = "Veuillez entrez un email Valide"
          }
        }else{
          this.resultEmail = "Veuillez entrez un email Valide"
        }
    }

  showPage(e){
    this.resultEmail =  "";
     this.resultConnexion = ""
    this.boole = true;
  }

  hidePage(e){
    this.resultEmail =  "";
     this.resultConnexion = ""
    this.boole = false;
  }
  login(e) {
    if((this.user.password != "") && (this.user.email != "")){
        RiotControl.trigger('user_connect', this.user);
        RiotControl.on('bad_auth', function(){
          this.resultConnexion = "Mauvais mot de passe ou email"
        }.bind(this));
    }
  }


  
  $(document).ready(function(){
      $('.box').hide().fadeIn(1000);
        ///password
  });

  
  $('a').click(function(event){
      event.preventDefault(); 
  });



</script>
</login>
