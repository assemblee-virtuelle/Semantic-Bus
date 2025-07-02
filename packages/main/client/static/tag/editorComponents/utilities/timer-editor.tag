<timer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Timer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <label class="labelFormStandard">Intervalle:</label>
  <div class="cardInput">
    <input class="inputComponents"  placeholder="Valeur en minute" type="text" id="intervalInput" onchange={changeIntervalInput} ref="keyInput" value={data.specificData?data.specificData.interval: null }></input>
  </div>
  <label class="labelFormStandard">Dernière exécution :</label>
  <div class="cardInput">
    <zendate value={this.last} mode="read"></zendate>
  </div>
  <label class="labelFormStandard">Prochaine exécution :</label>
  <div class="cardInput">
    <zendate ref="next" value={this.next} mode="edit"></zendate>
  </div>

  <script>

    this.data = {};

    changeIntervalInput(e) {
      //console.log('change',this.data.specificData,e);
      this.data.specificData.interval = e.target.value;
    }

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.last = dataToUpdate.specificData.last==undefined?undefined:new Date(dataToUpdate.specificData.last);
      this.next = dataToUpdate.specificData.next==undefined?undefined:new Date(dataToUpdate.specificData.next);
      this.update();
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
      this.refs.next.on('dateChanged',date=>{
        this.data.specificData.next=date;
        this.next= date;
      })
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</timer-editor>
