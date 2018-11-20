<google-geolocaliser-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Google-geocoding" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Google geocoding</div>
  <!-- Description du composant -->
  <div>Interroger l'API Google geocode pour trouver une adresse avec la latitude et la longitude.</div>
  <!-- Champ du composant -->
  <div >Champ de l'objet permettant de définir la position géographique.</div>
  <label>Rue:</label>
  <input placeholder="Rue" type="text" ref="streetInput" value={data.specificData.streetPath}></input>
  <label>Ville:</label>
  <input placeholder="Ville" type="text" ref="townInput" value={data.specificData.townPath}></input>
  <label>Code postal:</label>
  <input placeholder="Code postal" type="text" ref="postalCodeInput" value={data.specificData.postalCodePath}></input>
  <label>Pays:</label>
  <input placeholder="Pays" type="text" ref="countryInput" value={data.specificData.countryPath}></input>

  <div>Champ de l'objet qui recevront les informations de géolocalisation.</div>
  <label>Latitude:</label>
  <input placeholder="Latitude" type="text" ref="latitudeInput" value={data.specificData.latitudePath}></input>
  <label>Longitude:</label>
  <input placeholder="Longitude" type="text" ref="longitudeInput" value={data.specificData.longitudePath}></input>

  <script>

    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }
    this.updateData = function (dataToUpdate) {
      console.log('UPDATE');
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.innerData=data;      this.update();    }.bind(this),    get: function () {     return this.innerData;   },   configurable: true });
    this.on('mount', function () {
      this.refs.streetInput.addEventListener('change', function (e) {
        this.data.specificData.streetPath = e.currentTarget.value;
      }.bind(this));

      this.refs.townInput.addEventListener('change', function (e) {
        this.data.specificData.townPath = e.currentTarget.value;
      }.bind(this));
      this.refs.postalCodeInput.addEventListener('change', function (e) {
        this.data.specificData.postalCodePath = e.currentTarget.value;
      }.bind(this));

      this.refs.countryInput.addEventListener('change', function (e) {
        this.data.specificData.countryPath = e.currentTarget.value;
      }.bind(this));
      this.refs.latitudeInput.addEventListener('change', function (e) {
        this.data.specificData.latitudePath = e.currentTarget.value;
      }.bind(this));
      this.refs.longitudeInput.addEventListener('change', function (e) {
        this.data.specificData.longitudePath = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</google-geolocaliser-editor>
