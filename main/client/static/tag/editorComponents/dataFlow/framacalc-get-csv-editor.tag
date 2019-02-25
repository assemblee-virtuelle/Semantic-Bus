<framacalc-get-csv-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Framacalc" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <div class="subtitle">Information de connexion à Framacalc.</div>
  <label class="labelFormStandard">URL framacalc / Ethercalc:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder=""type="text" name="keyInput" ref="keyInput" value={data.specificData.key}></input>
  </div>
  <label class="labelFormStandard">Commencer à partir de la ligne (offset):</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder=""type="text" name="offsetInput" ref="offsetInput"  value={data.specificData.offset}></input>
  </div>
  <script>

    this.data={};

    /*
    Object.defineProperty(this, 'data', {
       set: function (dataDef) {
         this.data=dataDef;
         this.update();
       }.bind(this),
       get: function () {
        return this.data;
      },
      configurable: true
    });
    */

    this.updateData=function(dataToUpdate){
      this.data=dataToUpdate;
      console.log('data',this.data)
      this.update();
    }.bind(this);

    this.on('mount', function () {
      console.log(this.data.specificData)
      this.refs.keyInput.addEventListener('change',function(e){
        this.data.specificData.key=e.currentTarget.value;
      }.bind(this));


      this.refs.offsetInput.addEventListener('change',function(e){
        this.data.specificData.offset=e.currentTarget.value;
      }.bind(this));
      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</framacalc-get-csv-editor>
