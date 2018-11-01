<google-geolocaliser-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">GOOGLE GEOLOCALISER</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;width:90%">Ce composant permet d'interroger l’API de Google pour trouver la latitude et la longitude à partir de l’adresse de chaque enregistrement. Il se paramètre en précisant quelle propriété contient quel type d’information (rue, ville, pays…) et quelles propriétés vont être renseignées avec la latitude et la longitude.</label>
  <label style="padding-top: 10px;">Interroger l'API adresse.data.gouv pour transformer une adresse en latitude et longitude</label>
  <!-- Champ du composant -->
  <div class="contenaireH" style="justify-content:center; align-items: center;flex-wrap: wrap;width:600px;">
    <div style="padding-top: 10px;">Champ de l'objet permettant de définir la position géographique</div>
    <label style="padding-top: 10px;">Rue</label>
    <input class="field" style="width:600px;"placeholder="Rue"type="text" ref="streetInput" value={data.specificData.streetPath}></input>
    <label style="padding-top: 10px;">Ville</label>
    <input class="field" style="width:600px;"placeholder="Ville"type="text" ref="townInput" value={data.specificData.townPath}></input>
    <label style="padding-top: 10px;">Code postal</label>
    <input class="field" style="width:600px;"placeholder="Code postal"type="text" ref="postalCodeInput" value={data.specificData.postalCodePath}></input>
    <label style="padding-top: 10px;">Pays</label>
    <input class="field" style="width:600px;"placeholder="Pays"type="text" ref="countryInput" value={data.specificData.countryPath}></input>
  </div>
  <div class="contenaireH" style="justify-content:center; align-items: center;flex-wrap: wrap;width:600px;">
    <div style="padding-top: 10px;">Champ de l'objet qui recevront les informations de géolocalisation</div>
    <label style="padding-top: 10px;">Latitude</label>
    <input class="field" style="width:600px;"placeholder="Latitude"type="text" ref="latitudeInput" value={data.specificData.latitudePath}></input>
    <label style="padding-top: 10px;">Longitude</label>
    <input class="field" style="width:600px;"placeholder="Longitude"type="text" ref="longitudeInput" value={data.specificData.longitudePath}></input>
  </div>
  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
    }
    this.updateData=function(dataToUpdate){
      console.log('UPDATE');
      this.data=dataToUpdate;
      this.update();
    }.bind(this);


    // Object.defineProperty(this, 'data', {
    //    set: function (data) {
    //      this.innerData=data;
    //      this.update();
    //    }.bind(this),
    //    get: function () {
    //     return this.innerData;
    //   },
    //   configurable: true
    // });
    this.on('mount', function () {
      this.refs.streetInput.addEventListener('change',function(e){
        this.data.specificData.streetPath=e.currentTarget.value;
      }.bind(this));

      this.refs.townInput.addEventListener('change',function(e){
        this.data.specificData.townPath=e.currentTarget.value;
      }.bind(this));
      this.refs.postalCodeInput.addEventListener('change',function(e){
        this.data.specificData.postalCodePath=e.currentTarget.value;
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

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</google-geolocaliser-editor>
