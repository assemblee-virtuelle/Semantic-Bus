<deeper-focus-opening-bracket-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Deeper Focus Opening Bracket</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Début de traitement d'un niveau de profondeur du flux </label>
  <!-- Champ du composant -->
  <label style="padding-top: 10px;">Chemin à inspecter pour les traitements qui suivent</label>
  <input class="field" style="width:600px;"placeholder="vide=racine"type="text" name="dfobPathInput" ref="dfobPathInput" value={data.specificData.dfobPath} onchange={dfobPathChange}></input>
  <label style="padding-top: 10px;">Nombre de traitements parallèles</label>
  <input class="field" style="width:600px;"placeholder="champ libre"type="text" name="pipeNbInput" ref="pipeNbInput" value={data.specificData.pipeNb} onchange={pipeNbChange}></input>
  <label style="padding-top: 10px;">Le chemin désigne une structure de tableau à conserver en tableau (décomposé en objet par défaut)</label>
    <div class="containerH" style="justify-content:center; align-items: center;">
      <label class="switch">
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
      console.log(e.target,e.target.checked);
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
