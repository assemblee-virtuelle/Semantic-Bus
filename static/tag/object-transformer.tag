<object-transformer>
  <div>configuration d'un objet de transformation</div>
  <jsonEditor ref="jsonSchema" title="Transform Schema" style="flex:1" modes="['tree','text']"></jsonEditor>
  <script>
    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }
    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        if (data.specificData) {
          this.refs.jsonSchema.data = data.specificData.transformObject;
          data.specificData
        }
        this.update();
      }.bind(this),
      get: function () {
        //TODO add listerner to jsonEditor
        if (this.innerData.specificData) {
          this.innerData.specificData.transformObject = this.refs.jsonSchema.data;
          return this.innerData;
        } else {
          this.innerData.specificData = {}
          this.innerData.specificData.transformObject = this.refs.jsonSchema.data;
          return this.innerData;
        }
      },
      configurable: true
    });
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
</object-transformer>
