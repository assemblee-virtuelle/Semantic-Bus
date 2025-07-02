<google-get-json-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Google-Sheets" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div class="contenaireV warning">Ce composant est déprécié, consulter le documentation (point d'interogation bleu en haut à droite)</div>
 
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  <label class="labelFormStandard">Insérer la clé du Google Sheets:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="ex. 1ii9hG1_x-wQXFas1_K2ijy4FLY5eYh6XXKgj_mnvSQ8/edit#gid=0" type="text" id="keyInput" onkeyup={changeKeyInput} ref="keyInput" value={data?data.specificData.key: null }></input>
  </div>
  <label class="labelFormStandard">Selectionner les colonnes du Google Sheets:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="ex. select A,B,C,D,..." type="text" id="selectInput" ref="selectInput" onkeyup={changeSelectInput} value={data?data.specificData.select: null}></input>
  </div>
  <label class="labelFormStandard">Commencer à partir de la ligne (offset):</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="ex. 1,2,.." type="text" id="offsetInput" ref="offsetInput" onkeyup={changeOffsetInput} value={data? data.specificData.offset: null}></input>
  </div>
  <script>

    //// marche mais à changer je pense
    changeKeyInput(e) {
      if (this.data != null && this.data.specificData != null) {
        //console.log('keychange',this.data);
        this.data.specificData.key = e.currentTarget.value;
        RiotControl.trigger('item_current_updateField', {
          field: 'specificData.key',
          data: e.currentTarget.value
        });
      }
    };

    changeSelectInput(e) {
      if (this.data != null && this.data.specificData != null) {
        this.data.specificData.select = e.currentTarget.value;
      }
    };

    changeOffsetInput(e) {
      if (this.data != null && this.data.specificData != null) {
        this.data.specificData.offset = e.currentTarget.value;
      }
    };

    this.updateData = function (dataToUpdate) {
      // console.log('ALLO',dataToUpdate);
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style>
    .warning{
      color: red;
      font-size: 30px;
    }
  </style>
</google-get-json-editor>
