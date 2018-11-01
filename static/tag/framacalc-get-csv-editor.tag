<framacalc-get-csv-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">FRAMACALC CSV</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Intéroger une feuille de calcule Framacalc qui fourni un flux CSV</label>
  <!-- Champ du composant -->
  <div>Information de connexion à framacalc</div>
  <label style="padding-top: 10px;">Clé</label>
  <input class="field" style="width:600px;"placeholder="champ libre"type="text" name="keyInput" ref="keyInput" value={data.specificData.key}></input>
  <label style="padding-top: 10px;">Offset</label>
  <input class="field" style="width:600px;"placeholder="champ libre"type="text" name="offsetInput" ref="offsetInput"  value={data.specificData.offset}></input>
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
