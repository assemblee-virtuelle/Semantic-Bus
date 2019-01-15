<deeper-focus-opening-bracket-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Deeper-focus" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Deeper focus
  </div>
  <!-- Champ du composant -->
  <div>Début de traitement d'un niveau de profondeur du flux.</div>

  <label>Chemin à inspecter pour les traitements qui suivent:</label>
  <input placeholder="vide=racine" type="text" name="dfobPathInput" ref="dfobPathInput" value={data.specificData.dfobPath} onchange={dfobPathChange}></input>
  <label>Nombre de traitements parallèles:</label>
  <input placeholder="" type="text" name="pipeNbInput" ref="pipeNbInput" value={data.specificData.pipeNb} onchange={pipeNbChange}></input>

  <div class="containerH" style="align-items:center;">
    <label>Le chemin désigne une structure de tableau à conserver en tableau (décomposé en objet par défaut):</label>
    <label class="switch" style="margin-left:10px;">
      <input type="checkbox" onchange={keepArrayChange} checked={data.specificData.keepArray}>
      <span class="slider round"></span>
    </label>
  </div>

  <script>

    // this.innerData = {}; Object.defineProperty(this, 'data', {   set: function (data) {     this.innerData = data;     this.update();   }.bind(this),   get: function () {     return this.innerData;   },   configurable: true });

    this.dfobPathChange = function (e) {
      this.data.specificData.dfobPath = e.target.value;
    }.bind(this);
    this.pipeNbChange = function (e) {
      this.data.specificData.pipeNbChange = e.target.value;
    }.bind(this);
    this.keepArrayChange = function (e) {
      console.log(e.target, e.target.checked);
      this.data.specificData.keepArray = e.target.checked;
    }.bind(this);

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {

      this.refs.dfobPathInput.addEventListener('change', function (e) {
        this.data.specificData.dfobPath = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</deeper-focus-opening-bracket-editor>
