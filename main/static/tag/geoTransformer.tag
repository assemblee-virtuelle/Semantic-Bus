<geoTransformer>
  <h3>Transform geo</h3>
    <div id="adressContainer:this.adressContainer.value;" class="inlineBlockDisplay">
      <label>champ d'adresse</label><input type="text" name="adressInput" value={data.adress}/>
    </div>
    <div id="geoContainer" class="inlineBlockDisplay">
      <label>champ de geolocalisation</label><input type="text" name="geoInput" value={data.geo}/>
    </div>
  <script>
    Object.defineProperty(this, 'data', {
       set: function (data) {
          console.log('X '+data)
          data=data||{};
          this.innerData=data;
          this.update();
       }.bind(this),
       get: function () {
         console.log(this);
         return this.innerData;
       }
    });

   this.on('mount', function () {
    this.adressInput.addEventListener('change',function(e){
      //console.log(e.currentTarget.value);
     this.data.adress=e.currentTarget.value;
     this.trigger('adressChange',{
       adress:this.adressInput.value,
       geo:this.geoInput.value
     });
     //console.log(this);
    }.bind(this));
    this.geoInput.addEventListener('change',function(e){
      this.data.geo=e.currentTarget.value;
    }.bind(this));
   });

  </script>
  <style>


  </style>
</geoTransformer>
