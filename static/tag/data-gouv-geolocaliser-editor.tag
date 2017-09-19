<data-gouv-geolocaliser-editor>
  <div>
    <div>champ de l'objet permettant de définir la position géographique</div>
    <label>street</label>
    <input type="text" ref="streetInput" value={data.specificData.streetPath}></input>
    <label>town</label>
    <input type="text" ref="townInput" value={data.specificData.townPath}></input>
    <label>postalCode</label>
    <input type="text" ref="postalCodeInput" value={data.specificData.postalCodePath}></input>
    <label>country</label>
    <input type="text" ref="countryInput" value={data.specificData.countryPath}></input>
  </div>
  <div>
    <div>champ de l'objet qui recevront les informations de géolocalisation</div>
    <label>latitude</label>
    <input type="text" ref="latitudeInput" value={data.specificData.latitudePath}></input>
    <label>longitude</label>
    <input type="text" ref="longitudeInput" value={data.specificData.longitudePath}></input>
  </div>
  <script>

    this.data = {};
    this.data.specificData = {}
    this.test=function(){
      consol.log('test');
    }

    
    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.update();
    }.bind(this);
  
    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
      this.refs.streetInput.addEventListener('change',function(e){
        this.data.specificData.streetPath=e.currentTarget.value;
      }.bind(this));

      this.refs.townInput.addEventListener('change',function(e){
        this.data.specificData.townPath=e.currentTarget.value;
      }.bind(this));
      this.refs.postalCodeInput.addEventListener('change',function(e){
        this.data.specificData.postalCodePath = e.currentTarget.value;
      }.bind(this));

      this.refs.countryInput.addEventListener('change',function(e){
        this.data.specificData.countryPath=e.currentTarget.value;
      }.bind(this));
      this.refs.latitudeInput.addEventListener('change',function(e){
        this.data.specificData.latitudePath=e.currentTarget.value;
      }.bind(this));
      this.refs.longitudeInput.addEventListener('change',function(e){
        this.data.specificData.longitudePath=e.currentTarget.value;
      }.bind(this));

      
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</data-gouv-geolocaliser-editor>
