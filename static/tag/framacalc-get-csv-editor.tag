<framacalc-get-csv-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Framacalc" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Framacalc</div>
  <!-- Description du composant -->
  <div>Interroger une feuille de calcule Framacalc qui fournit un flux CSV.</div>
  <!-- Champ du composant -->
  <div>Information de connexion à framacalc.</div>
  <label>Clé:</label>
  <input class="field" placeholder="champ libre"type="text" name="keyInput" ref="keyInput" value={data.specificData.key}></input>
  <label>Commencer à partir de la ligne (offset):</label>
  <input class="field" placeholder="champ libre"type="text" name="offsetInput" ref="offsetInput"  value={data.specificData.offset}></input>
  <script>

    this.innerData={};

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
    this.updateData=function(dataToUpdate){
      this.innerData=dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.refs.keyInput.addEventListener('change',function(e){
        this.innerData.specificData.key=e.currentTarget.value;
      }.bind(this));


      this.refs.offsetInput.addEventListener('change',function(e){
        this.innerData.specificData.offset=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</framacalc-get-csv-editor>
