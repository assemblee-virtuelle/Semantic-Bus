<google-get-json-editor class="containerV" style="justify-content:center; align-items: center;">
<!-- Titre du composant -->
<div class="contenaireV title-component">GOOGLE SHEET GET JSON</div>
<!-- Description du composant -->
  <div style="padding-top: 10px;">Intéroger une feuille de calcule GOOGLE sheets pour fournir un flux JSON</div>
  <div style="padding-top: 10px;width:600px;">Ce composant est à paramétrer avec l’adresse d’une feuille de calcul Google Sheet. Il interroge l’API de Google pour récupérer les données et les transforme en objet.</div>

  <!-- Champ du composant -->
  <label style="padding-top: 10px;" >Insérer la clé du Google Sheet</label>
  <input class="field" style="width:600px;"placeholder="ex. 1ii9hG1_x-wQXFas1_K2ijy4FLY5eYh6XXKgj_mnvSQ8/edit#gid=0" type="text" id="keyInput" onKeyup={changeKeyInput} ref="keyInput" value={data?data.specificData.key: null }></input>
  <label style="padding-top: 10px;">Selectionner les colonnes du Google Sheet</label>
  <input class="field" style="width:600px;"placeholder="ex. select A,B,C,D,..."type="text" id="selectInput" ref="selectInput" onKeyup={changeSelectInput} value={data?data.specificData.select: null}></input>
  <label style="padding-top: 10px;">Commencer à partir de la ligne :(offset) </label>
  <input class="field" style="width:600px;"placeholder="ex. 1,2,.." type="text" id="offsetInput" ref="offsetInput"  onKeyup={changeOffsetInput} value={data? data.specificData.offset: null}></input>
  <script>

  //// marche mais à changer je pense
  changeKeyInput(e){
    if(this.data != null && this.data.specificData != null ){
      //console.log('keychange',this.data);
      this.data.specificData.key = e.currentTarget.value;
      RiotControl.trigger('item_current_updateField',{field:'specificData.key',data:e.currentTarget.value});
    }
  };

  changeSelectInput(e){
    if(this.data != null && this.data.specificData != null ){
      this.data.specificData.select= e.currentTarget.value;
    }
  };

  changeOffsetInput(e){
    if(this.data != null && this.data.specificData != null ){
      this.data.specificData.offset = e.currentTarget.value;
    }
  };

  this.updateData=function(dataToUpdate){
    console.log('ALLO',dataToUpdate);
    this.data = dataToUpdate;
    this.update();
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });


  </script>
</google-get-json-editor>
