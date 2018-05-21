<deeper-focus-opening-bracket-editor>

  <label>chemin à inspecter pour les traitements qui suivent (vide=racine)</label>
  <input type="text" name="dfobPathInput" ref="dfobPathInput" value={data.specificData.dfobPath} onchange={dfobPathChange}></input>
  <label>nombre de traitements parallèls</label>
  <input type="text" name="pipeNbInput" ref="pipeNbInput" value={data.specificData.pipeNb} onchange={pipeNbChange}></input>


    <label >
      le chemin designe une structure de tableau à conserver en tableau (décomposé en objet par défaut)
    </label>
    <div class="containerH">
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
