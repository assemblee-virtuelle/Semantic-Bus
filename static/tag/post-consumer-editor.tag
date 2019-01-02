<post-consumer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Post-Consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
<!-- Titre du composant -->
  <div class="contenaireV title-component">Post Consumer</div>
<!-- Description du composant -->
  <div>Envoyer les données en post vers une URL externe.</div>
<!-- Champ du composant -->
  <label>URL externe où envoyer les données:</label>
  <input placeholder="" type="text" name="urlInput" ref="urlInput" onChange={this.urlInputChanged} value={data.specificData.url}></input>
  <label>Content-type:</label>
  <input placeholder="application/json" type="text" name="contentTypeInput" ref="contentTypeInput" onChange={this.contentTypeInputChanged} value={data.specificData.contentType}></input>

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
