<login>
  <!-- <div id="containerloaderDiv">
      <div id="row">
        <div id="loaderDiv"></div>
        <h1 id="loaderText"> Connection en cour </h1>
      </div>
    </div> -->
  <div class="Aligner" show={boole}>
    <form >
    <h1>Bienvenue sur le bus Semantic</h1>
      <div class="box">
        <input type="email" name="email"  placeholder="saisir email" class="email" />
        <input type="password" name="password" id="password" placeholder="saisir mot de passe" class="email" required />
        <div id="result">{resultConnexion}</div>
        <div class="flex-container">
          <a onclick = {hidePage} class="btn">Inscription</a> 
          <a onclick = {login} id="btn2">Connexion</a> <!-- End Btn2 -->
          <div class="google">
            <a href="/auth/google" id="btn-google"><img src="../ihm/image/google-plus.png" alt="" id="googleP">  Connexion</a>
            <!-- End Btn2 --> 
          </div>
        </div>
      </div> <!-- End Box -->  
      <p>mot de passe oublié? <u style="color:#f1c40f;">Clicker pas ici!</u></p>
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
         
         <div class="flex-container">
          <button onclick={showPage} id="btn3">Retour</button> 
          <a onclick = {inscription} id="btn3">Inscription</a> 
          <div>
      </div> 
  </form>
</div>

<style scoped>

#containerloaderDiv {
    background-color:rgba(200,200,200,0.2);
    width:100%;
    height:100%;
    padding: 0;
    margin: 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #row {
    width: auto;
  }

  #loaderText {
    padding-top:5%;
    color:#3498db;
    font-family: 'Raleway', sans-serif;
    text-align:center;
  }
  #loaderDiv {
    border: 16px solid #f3f3f3; /* Light grey */
    border-top: 16px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    margin-left:20vw
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
    .persistInProgress {
      color: red;
    }
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
    width:500px;
    border-radius:6px;
    margin: 0 auto 0 auto;
    padding:10px 10px 10px 10px;
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

  .flex-container {
      display: flex;
      justify-content: space-around;
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
    cursor: pointer;
  }

  #googleP {
    width: 30px;
    position: absolute;
    margin-top: -0.6vh;
    margin-left: 2vw; 
  }

  #btn-google {
    background: #dc4e41;
    width: 125px;
    color:#dc4e41;
    padding-top: 5px;
    padding-bottom: 5px;
    border-radius: 4px;
    margin-top: 20px;
    margin-bottom: 20px;
    float: left;
    margin-left: 16px;
    font-weight: 800;
    font-size: 0.8em;
  }

  .btn:hover{
    background:#2CC06B;
  }

    #btn3{
    float:left;
    background:#3498db;
    width:125px;  padding-top:5px;
    padding-bottom:5px;
    color:white;
    border-radius:4px;
    border: #2980b9 1px solid;
    
    margin-top:20px;
    margin-bottom:20px;
    margin-left:50px;
    font-weight:800;
    font-size:0.8em;
    cursor: pointer;
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
    cursor: pointer;
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
    this.update();
  }.bind(this));

  this.password.addEventListener('change',function(e){
    this.user.password = e.currentTarget.value;
     this.update();
  }.bind(this));


  this.emailInscription.addEventListener('change',function(e){
    this.resultEmail = ""
    this.newUser.emailInscription = e.currentTarget.value;
     this.update();
  }.bind(this));

  this.passwordInscription.addEventListener('change',function(e){
    this.newUser.passwordInscription = e.currentTarget.value;
     this.update();
  }.bind(this));

   this.confirmPasswordInscription.addEventListener('change',function(e){
    this.newUser.confirmPasswordInscription = e.currentTarget.value;
     this.update();
  }.bind(this));

  this.isGoogleUser = function () {
     if(location.search.split('google_token=')[1] != null){
       var googleToken = location.search.split('google_token=')[1]
       console.log(googleToken);
       RiotControl.trigger('google_connect', googleToken);
    }
  }
  ///SPINNER
  // RiotControl.on("ajax_receipt", function(){
  //   console.log("in hide");
  //   $("#containerloaderDiv").hide();
  //   this.update()
  // }.bind(this));

  // RiotControl.on("ajax_send", function(){
  //   console.log("in show");
  //   $("#containerloaderDiv").show();
  //   this.update()
  // }.bind(this));

  this.isGoogleUser();
 

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
      RiotControl.on('google_auth', function(){
        console.log("Connectez vous avec Google")
        this.resultConnexion = "Connectez vous avec Google";
        this.update();
      }.bind(this))
      RiotControl.on('bad_auth', function(){
        this.resultConnexion = "Mauvais mot de passe ou email"
        this.update();
      }.bind(this));
    }
  }

  loginGoogle(e){
      RiotControl.trigger('google_user_connect', this.user);
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
