<post-consumer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Post-consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  
  <label class="labelFormStandard">URL externe où envoyer les données:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" name="urlInput" ref="urlInput" onChange={this.urlInputChanged} value={data.specificData.url}></input>
  </div>
  <label class="labelFormStandard">Content-type:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="application/json" type="text" name="contentTypeInput" ref="contentTypeInput" onChange={this.contentTypeInputChanged} value={data.specificData.contentType}></input>
  </div>
  <script>
    this.data = {};
    this.urlInputChanged = e => {
      this.data.specificData.url = e.currentTarget.value;
    };
    this.contentTypeInputChanged = e => {
      this.data.specificData.contentType = e.currentTarget.value;
    };
    this.updateData = dataToUpdate => {
      this.data = dataToUpdate;
      this.update();
    };
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</post-consumer-editor>
