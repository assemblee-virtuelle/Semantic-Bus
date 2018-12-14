<webhook-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Webhook" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
<!-- Titre du composant -->
  <div class="contenaireV title-component">Webhook</div>
<!-- Description du composant -->
  <div>Envoyer les données en push sur une URL externe.</div>
<!-- Champ du composant -->
  <label>URL externe à appeler:</label>
  <input placeholder=""type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.url}></input>
  <label>Content-type:</label>
  <input placeholder="application/json" type="text" name="contentTypeInput" ref="contentTypeInput" onChange={contentTypeInputChanged} value={data.specificData.contentType}></input>

  <script>
    this.data = {};
    urlInputChanged(e) {
      this.data.specificData.url = e.currentTarget.value;
    }
    contentTypeInputChanged(e) {
      this.data.specificData.contentType = e.currentTarget.value;
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
</webhook-editor>
