<timer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Timer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Timer</div>
  <!-- Champ du composant -->
  <label>Exécuter un flux selon la planification suivante :</label>
  <label>Intervalle:</label>
  <input placeholder="Valeur en minute" type="text" id="intervalInput" onchange={changeIntervalInput} ref="keyInput" value={data.specificData?data.specificData.interval: null }></input>
  <label>Dernière exécution :</label>
  <div>{data.specificData?data.specificData.last: null }</div>

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
