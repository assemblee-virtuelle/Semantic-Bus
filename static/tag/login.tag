<login>
<div class="Aligner">
  <form method="post" action="index.html">
  <h1>Bienvenue sur le bus Semantic</h1>
    <div class="box">
      <input type="email" name="email" value="email" onFocus="field_focus(this, 'email');" onblur="field_blur(this, 'email');" class="email" />
        
      <input type="password" name="email" value="email" onFocus="field_focus(this, 'email');" onblur="field_blur(this, 'email');" class="email" />
        
      <a href="#"><div class="btn">Inscription</div></a> <!-- End Btn -->

      <a href="#"><div id="btn2">Connexion</div></a> <!-- End Btn2 -->
    </div> <!-- End Box -->  
    <p>mot de passe oublié? <u style="color:#f1c40f;">Clicker ici!</u></p>
  </form>

  
</div>

  <script>
    
    function field_focus(field, email)
    {
      if(field.value == email)
      {
        field.value = '';
      }
    }

    function field_blur(field, email)
    {
      if(field.value == '')
      {
        field.value = email;
      }
    }

  //Fade in dashboard box
  $(document).ready(function(){
      $('.box').hide().fadeIn(1000);
      });

  //Stop click event
  $('a').click(function(event){
      event.preventDefault(); 
    });

    </script>
    <style>
    body{
    font-family: 'Open Sans', sans-serif;
    background:#3498db;
    margin: 0 auto 0 auto;  
    width:100%; 
    text-align:center; 
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

</login>
