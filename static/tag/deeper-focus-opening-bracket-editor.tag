<deeper-focus-opening-bracket-editor>

  <label>chemin à inspecter pour les traitements qui suivent</label>
  <input type="text" name="dfobPathInput" value={data.specificData.dfobPath}></input>
  <script>

    this.innerData = {};

    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      },
      configurable: true
    });


    this.on('mount', function () {

      this.dfobPathInput.addEventListener('change', function (e) {
        this.innerData.specificData.dfobPath = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed', function (data) {
        this.innerData = data;
        this.update();
      }.bind(this));
    });
  </script>
</deeper-focus-opening-bracket-editor>
