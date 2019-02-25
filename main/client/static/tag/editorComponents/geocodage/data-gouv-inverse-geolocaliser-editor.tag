<data-gouv-inverse-geolocaliser-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-data.gouv-reverse-geocoding" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <div class="subtitle">Champs de l'objet permettant de définir la position géographique.</div>
  <label class="labelFormStandard">Latitude:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Latitude" type="text" ref="latInput" value={data.specificData.latitudePath}></input>
  </div>
  <label class="labelFormStandard">Longitude:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Longitude" type="text" ref="lngInput" value={data.specificData.longitudePath}></input>
  </div>
  <div class="subtitle">Champs de l'objet qui recevront les informations de géolocalisation.</div>
  <label class="labelFormStandard">Code postal:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Code postal" type="text" ref="CPInput" value={data.specificData.CPPath}></input>
  </div>
  <label class="labelFormStandard">Code Insee:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="Code Insee" type="text" ref="INSEEInput" value={data.specificData.INSEEPath}></input>
  </div>
  <script>

    this.data = {};
    this.test = function () {
      consol.log('test');
    }
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    /*
    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.data = data;
        this.update();
      }.bind(this),
      get: function () {
        return this.data;
      },
      configurable: true
    });
    */
    
    this.on('mount', function () {
      this.refs.latInput.addEventListener('change', function (e) {
        this.data.specificData.latitudePath = e.currentTarget.value;
      }.bind(this));

      this.refs.lngInput.addEventListener('change', function (e) {
        this.data.specificData.longitudePath = e.currentTarget.value;
      }.bind(this));
      this.refs.INSEEInput.addEventListener('change', function (e) {
        this.data.specificData.INSEEPath = e.currentTarget.value;
      }.bind(this));

      this.refs.CPInput.addEventListener('change', function (e) {
        this.data.specificData.CPPath = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</data-gouv-inverse-geolocaliser-editor>
