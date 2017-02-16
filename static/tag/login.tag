<login>
  <div class="containerV" style="flex-basis:50%">
    <div class="containerH" style="flex-basis:50%">
      <h3>mail</h3>
      <div >
        <div><input type="text" name="email" value={data.email}/></div>
      </div>
      <h3>password</h3>
      <div >
        <div><input type="password" name="password" value={data.password}/></div>
      </div>
      <div >
        <div><input type="password" name="password" value={data.password}/></div>
      </div>
      <div class="containerH commandBar" style="flex-basis:50px">
          <div class="commandGroup" class="containerH">
          </div>
          <div class="commandTitle">
          </div>
          <div class="commandGroup containerH">
            <div onclick={loginClick} class="commandButton">
              Login
            </div>
          </div>
        </div>
    </div>
  </div>


 <script>

   this.on('mount', function () {
     this.email.addEventListener('change',function(e){
       this.data.email=e.currentTarget.value;
     }.bind(this));
     this.password.addEventListener('change',function(e){
       this.data.password=e.currentTarget.value;
     }.bind(this));
   });

  </script>
  <style>
  </style>

</login>
