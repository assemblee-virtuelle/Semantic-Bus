<data-gouv-inverse-geolocaliser-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">adresse.data.gouv.fr geolocaliser inversé</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;width:90%">Ce composant permet d'interroger l’API de adresse.data.gouv pour trouver une adresse + code postal + code Insee à partir de la latitude et la longitude.</label>
  <label style="padding-top: 10px;">Interroge l'API adresse.data.gouv pour retrouver une adresse + code postal + code Insee depuis la latitude et la longitude.</label>
  <!-- Champ du composant -->
  <div class="contenaireH" style="justify-content:center; align-items: center;flex-wrap: wrap;width:600px;">
    <div style="padding-top: 10px;">Champ de l'objet permettant de définir la position géographique</div>
    <label style="padding-top: 10px;">Latitude</label>
    <input class="field" style="width:600px;"placeholder="Latitude"type="text" ref="latInput" value={data.specificData.latitudePath}></input>
    <label style="padding-top: 10px;">Longitude</label>
    <input class="field" style="width:600px;"placeholder="Longitude"type="text" ref="lngInput" value={data.specificData.longitudePath}></input>
  </div>
  <div class="contenaireH" style="justify-content:center; align-items: center;flex-wrap: wrap;width:600px;">
    <div style="padding-top: 10px;">Champ de l'objet qui recevront les informations de l'adresse</div>
    <label style="padding-top: 10px;">Code postal</label>
    <input class="field" style="width:600px;"placeholder="Code postal"type="text" ref="CPInput" value={data.specificData.CPPath}></input>
    <label style="padding-top: 10px;">Code Insee</label>
    <input class="field" style="width:600px;"placeholder="Code Insee"type="text" ref="INSEEInput" value={data.specificData.INSEEPath}></input>
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
      this.refs.latInput.addEventListener('change',function(e){
        this.innerData.specificData.latitudePath=e.currentTarget.value;
      }.bind(this));

      this.refs.lngInput.addEventListener('change',function(e){
        this.innerData.specificData.longitudePath=e.currentTarget.value;
      }.bind(this));
      this.refs.INSEEInput.addEventListener('change',function(e){
        this.innerData.specificData.INSEEPath=e.currentTarget.value;
      }.bind(this));

      this.refs.CPInput.addEventListener('change',function(e){
        this.innerData.specificData.CPPath=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</data-gouv-inverse-geolocaliser-editor>
