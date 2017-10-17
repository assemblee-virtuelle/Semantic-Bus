<filter-editor>
  <div>description de l'api</div>
  <label>filtre</label>
  <jsonEditor ref="filterObjectInput" title="Filter Schema" style="flex:1" modes="['tree','text']"></jsonEditor>

  <script>
    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }


    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        if (data.specificData.filterString != undefined) {
          this.refs.filterObjectInput.data = JSON.parse(data.specificData.filterString);
        }
        this.update();
      }.bind(this),
      get: function () {

        this.innerData.specificData.filterString = JSON.stringify(this.refs.filterObjectInput.data);
        return this.innerData;
      },
      configurable: true
    });
    this.updateData=function(dataToUpdate){
      this.data=dataToUpdate;
      this.update();
    }.bind(this);


    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</filter-editor>
