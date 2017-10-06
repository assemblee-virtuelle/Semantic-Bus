<cache-nosql-editor>


  <div>mettre en cache les data et les réintéroger</div>
  <jsonEditor ref="cachedData" mode="text" style="flex-grow:1">
  </jsonEditor>
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

    reloadCacheClick(e) {
      RiotControl.trigger('item_current_reloadCache');
    }
    getCacheClick(e) {
      RiotControl.trigger('item_current_getCache');
    }
    this.updateData=function(dataToUpdate){
      this.innerData = dataToUpdate;
      this.update();
    }.bind(this);

    RiotControl.on('item_current_getCache_done', function (data) {
      //this.cahedData = data;
      this.refs.cachedData.data = data;
      this.update();
    }.bind(this));

    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
      RiotControl.trigger('item_current_getCache');
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });
  </script>
</cache-nosql-editor>
