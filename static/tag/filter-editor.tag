<filter-editor>

  <div>description de l'api</div>
  <label>filtre</label>
  <!--<input type="text" name="filterStringInput" value={data.specificData.filterString}></input>-->
  <jsonEditor name="filterObjectInput" title="Filter Schema" style="flex:1" modes="['tree','text']"></jsonEditor>

  <script>

    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }

    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        //console.log(this.tags.filterObjectInput);
        if (data.specificData.filterString != undefined) {
          this.tags.filterObjectInput.data = JSON.parse(data.specificData.filterString);
        }
        this.update();
      }.bind(this),
      get: function () {
        //console.log('JSONEditorData | ', this.tags.filterObjectInput.data);
        this.innerData.specificData.filterString = JSON.stringify(this.tags.filterObjectInput.data);
        return this.innerData;
      },
      configurable: true
    });

    this.on('mount', function () {
      /*this.filterStringInput.addEventListener('change', function (e) {
        this.innerData.specificData.filterString = e.currentTarget.value;
      }.bind(this));*/
    });

    RiotControl.on('item_current_changed', function (data) {
      this.data = data;
    }.bind(this));
  </script>
</filter-editor>
