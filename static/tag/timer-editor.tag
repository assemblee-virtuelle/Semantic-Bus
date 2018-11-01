<timer-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">TIMER</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;width:90%;">Ce composant va déclencher à intervalles de temps réguliers le traitement des données afin de maintenir des données à jour dans le cache (composant suivant). L’intervalle de temps est paramétrable.</label>
  <!-- Champ du composant -->
  <div style="padding-top: 10px;">Exécuter un flux selon la planification suivante :</div>
  <label style="padding-top: 10px;">Intervalle</label>
  <input class="field" style="width:300px;"placeholder="Valeur en minute"type="text" id="intervalInput" onChange={changeIntervalInput} ref="keyInput" value={data.specificData?data.specificData.interval: null }></input>
  <label style="padding-top: 10px;">Dernière exécution :</label>
  <div>{data.specificData?data.specificData.last: null }</div>


  <script>

    this.data = {};

    changeIntervalInput(e){
      //console.log('change',this.data.specificData,e);
      this.data.specificData.interval=e.target.value;
    }

    this.updateData=function(dataToUpdate){
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
</timer-editor>
