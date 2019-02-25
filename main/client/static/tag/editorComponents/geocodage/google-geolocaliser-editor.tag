<google-geolocaliser-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Google-geocoding" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
 <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <div class="subtitle">Champ de l'objet permettant de définir la position géographique.</div>
  <label class="labelFormStandard">Rue:</label>
  <div class="cardInput">  
    <input class="inputComponents" placeholder="Rue" type="text" ref="streetInput" value={data.specificData.streetPath}></input>
  </div>
  <label class="labelFormStandard">Ville:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Ville" type="text" ref="townInput" value={data.specificData.townPath}></input>
  </div>
  <label class="labelFormStandard">Code postal:</label>
  <div class="cardInput">
    <input class="inputComponents"placeholder="Code postal" type="text" ref="postalCodeInput" value={data.specificData.postalCodePath}></input>
  </div>
  <label class="labelFormStandard">Pays:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Pays" type="text" ref="countryInput" value={data.specificData.countryPath}></input>
  </div>
  <div class="subtitle"r>Champ de l'objet qui recevront les informations de géolocalisation.</div>
  <label class="labelFormStandard">Latitude:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Latitude" type="text" ref="latitudeInput" value={data.specificData.latitudePath}></input>
  </div>
  <label class="labelFormStandard">Longitude:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Longitude" type="text" ref="longitudeInput" value={data.specificData.longitudePath}></input>
  </div>
  <script>

    this.data = {};
    this.test = function () {
      consol.log('test');
    }
    this.updateData = function (dataToUpdate) {
      console.log('UPDATE');
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.data=data;      this.update();    }.bind(this),    get: function () {     return this.data;   },   configurable: true });
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
