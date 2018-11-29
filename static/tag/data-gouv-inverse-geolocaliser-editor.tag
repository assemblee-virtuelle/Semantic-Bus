<data-gouv-inverse-geolocaliser-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-data.gouv-reverse-geocoding" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">data.gouv.fr reverse geocoding
  </div>
  <div>Interroger l'API adresse.data.gouv.fr pour trouver la latitude et la longitude avec une adresse.</div>
  <!-- Champ du composant -->
  <div>Champ de l'objet permettant de définir la position géographique.</div>
  <label>Latitude:</label>
  <input placeholder="Latitude" type="text" ref="latInput" value={data.specificData.latitudePath}></input>
  <label>Longitude:</label>
  <input placeholder="Longitude" type="text" ref="lngInput" value={data.specificData.longitudePath}></input>
  <div>Champ de l'objet qui recevront les informations de l'adresse.</div>
  <label>Code postal:</label>
  <input placeholder="Code postal" type="text" ref="CPInput" value={data.specificData.CPPath}></input>
  <label>Code Insee:</label>
  <input placeholder="Code Insee" type="text" ref="INSEEInput" value={data.specificData.INSEEPath}></input>

  <script>

    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }
    this.updateData = function (dataToUpdate) {
      this.innerData = dataToUpdate;
      this.update();
    }.bind(this);

    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function () {
      this.refs.latInput.addEventListener('change', function (e) {
        this.innerData.specificData.latitudePath = e.currentTarget.value;
      }.bind(this));

      this.refs.lngInput.addEventListener('change', function (e) {
        this.innerData.specificData.longitudePath = e.currentTarget.value;
      }.bind(this));
      this.refs.INSEEInput.addEventListener('change', function (e) {
        this.innerData.specificData.INSEEPath = e.currentTarget.value;
      }.bind(this));

      this.refs.CPInput.addEventListener('change', function (e) {
        this.innerData.specificData.CPPath = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</data-gouv-inverse-geolocaliser-editor>
