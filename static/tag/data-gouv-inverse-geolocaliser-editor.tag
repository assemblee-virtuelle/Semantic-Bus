<data-gouv-inverse-geolocaliser-editor>
  <div>
    <div>champ de l'objet permettant de définir la position géographique</div>
    <label>latitude</label>
    <input type="text" name="latInput" value={data.specificData.latitudePath}></input>
    <label>longitude</label>
    <input type="text" name="lngInput" value={data.specificData.longitudePath}></input>
  </div>
  <div>
    <div>champ de l'objet qui recevront les informations de l'adresse</div>
    <label>Postal Code</label>
    <input type="text" name="CPInput" value={data.specificData.CPPath}></input>
    <label>Insee Code</label>
    <input type="text" name="INSEEInput" value={data.specificData.INSEEPath}></input>
  </div>
  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
    }
    this.updateData=function(dataToUpdate){
      this.innerData=dataToUpdate;
      this.update();
    }.bind(this);


    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData=data;
         this.update();
       }.bind(this),
       get: function () {
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function () {
      this.latInput.addEventListener('change',function(e){
        this.innerData.specificData.latitudePath=e.currentTarget.value;
      }.bind(this));

      this.lngInput.addEventListener('change',function(e){
        this.innerData.specificData.longitudePath=e.currentTarget.value;
      }.bind(this));
      this.INSEEInput.addEventListener('change',function(e){
        this.innerData.specificData.INSEEPath=e.currentTarget.value;
      }.bind(this));

      this.CPInput.addEventListener('change',function(e){
        this.innerData.specificData.CPPath=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</data-gouv-inverse-geolocaliser-editor>
