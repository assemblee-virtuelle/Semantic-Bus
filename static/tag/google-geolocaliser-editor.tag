<google-geolocaliser-editor>
  <div>
    <div>champ de l'objet permettant de définir la position géographique</div>
    <label>street</label>
    <input type="text" name="streetInput" value={data.specificData.streetPath}></input>
    <label>town</label>
    <input type="text" name="townInput" value={data.specificData.townPath}></input>
    <label>postalCode</label>
    <input type="text" name="postalCodeInput" value={data.specificData.postalCodePath}></input>
    <label>country</label>
    <input type="text" name="countryInput" value={data.specificData.countryPath}></input>
  </div>
  <div>
    <div>champ de l'objet qui recevront les informations de géolocalisation</div>
    <label>latitude</label>
    <input type="text" name="latitudeInput" value={data.specificData.latitudePath}></input>
    <label>longitude</label>
    <input type="text" name="longitudeInput" value={data.specificData.longitudePath}></input>
  </div>
  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
    }

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
      this.streetInput.addEventListener('change',function(e){
        this.innerData.specificData.streetPath=e.currentTarget.value;
      }.bind(this));

      this.townInput.addEventListener('change',function(e){
        this.innerData.specificData.townPath=e.currentTarget.value;
      }.bind(this));
      this.postalCodeInput.addEventListener('change',function(e){
        this.innerData.specificData.postalCodePath=e.currentTarget.value;
      }.bind(this));

      this.countryInput.addEventListener('change',function(e){
        this.innerData.specificData.countryPath=e.currentTarget.value;
      }.bind(this));
      this.latitudeInput.addEventListener('change',function(e){
        this.innerData.specificData.latitudePath=e.currentTarget.value;
      }.bind(this));
      this.longitudeInput.addEventListener('change',function(e){
        this.innerData.specificData.longitudePath=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',function(data){
        this.innerData=data;
        this.update();
      }.bind(this));
    });

  </script>
</google-geolocaliser-editor>
