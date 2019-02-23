<value-from-path-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Root-from-path" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Root from path</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">Extraire une valeur par son chemin.</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <label class="labelFormStandard">Chemin vers la valeur à récupérer et la mettre à la racine:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" name="pathInput" ref="pathInput" value={data.specificData.path} onChange={pathInputChange}></input>
  </div>
  <script>

    this.updateData=function(dataToUpdate){
      this.data=dataToUpdate;
      this.update();
    }.bind(this);

    this.pathInputChange=function(e){
      this.data.specificData.path=e.target.value;
    }.bind(this);


    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });
  </script>
</value-from-path-editor>
