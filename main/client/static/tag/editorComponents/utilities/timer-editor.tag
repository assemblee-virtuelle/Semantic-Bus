<timer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Timer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Timer</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <div class="title-description-component">Exécuter un flux selon la planification suivante.</div>
  <!-- Champ du composant -->
  <div>
    <div
     class="bar"/>
  </div>
  <label class="labelFormStandard">Intervalle:</label>
  <div class="cardInput">
    <input class="inputComponents"  placeholder="Valeur en minute" type="text" id="intervalInput" onchange={changeIntervalInput} ref="keyInput" value={data.specificData?data.specificData.interval: null }></input>
  </div>
  <label class="labelFormStandard">Dernière exécution :</label>
  <div class="cardInput">
    <div>{data.specificData?data.specificData.last: null }</div>
  </div>
  <script>

    this.data = {};

    changeIntervalInput(e) {
      //console.log('change',this.data.specificData,e);
      this.data.specificData.interval = e.target.value;
    }

    this.updateData = function (dataToUpdate) {
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
</timer-editor>
