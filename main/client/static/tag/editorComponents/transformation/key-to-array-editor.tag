<key-to-array-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Key-to-array" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <script>
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.data.specificData = this.data.specificData || {};
      this.update();
    }.bind(this);
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</key-to-array-editor>
