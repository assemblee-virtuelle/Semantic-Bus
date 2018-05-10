<deeper-focus-opening-bracket-editor>

  <label>chemin à inspecter pour les traitements qui suivent (vide=racine)</label>
  <input type="text" name="dfobPathInput" ref="dfobPathInput" value={data.specificData.dfobPath}></input>
  <!--
    <label >
      focus permanent (nécessite une fin de focus)
    </label>
    <div class="containerH">
      <label class="switch">
        <input type="checkbox" onchange={onPermantFocusChange} checked={data.specificData.permanentFocus}>
        <span class="slider round"></span>
      </label>
    </div>
-->
  <script>

    // this.innerData = {};

    // Object.defineProperty(this, 'data', {
    //   set: function (data) {
    //     this.innerData = data;
    //     this.update();
    //   }.bind(this),
    //   get: function () {
    //     return this.innerData;
    //   },
    //   configurable: true
    // });
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
