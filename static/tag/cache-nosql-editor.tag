<cache-nosql-editor>


  <div>mettre en cache les data et les réintéroger</div>
  <label>Historisation</label>
  <input ref="historyInput" type="checkbox" onchange={historyInputChanged} checked={data.specificData.history}></input>
  <label>Sortie avec historique</label>
  <input ref="historyOutInput" type="checkbox" onchange={historyOutInputChanged} checked={data.specificData.historyOut}></input>
  <jsonEditor ref="cachedData" mode="text" style="flex-grow:1">
  </jsonEditor>
  <script>

    this.data={};
    // this.innerData = {};
    //
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

    // reloadCacheClick(e) {
    //   RiotControl.trigger('item_current_reloadCache');
    // }
    // getCacheClick(e) {
    //   RiotControl.trigger('item_current_getCache');
    // }

    historyInputChanged(e){
      console.log(e);
      if(this.data != null && this.data.specificData != null ){
        this.data.specificData.history = e.target.checked;
      }
    }

    historyOutInputChanged(e){
      if(this.data != null && this.data.specificData != null ){
        this.data.specificData.historyOut = e.target.checked;
      }
    }

    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.refreshCache=function(cachedData){
      this.refs.cachedData.data = cachedData;
      this.update();
    }.bind(this);



    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
      RiotControl.on('item_current_getCache_done', this.refreshCache);
      RiotControl.trigger('item_current_getCache');
    });
    this.on('unmount', function () {
      console.log('UNMOUNT');
      RiotControl.off('item_current_changed',this.updateData);
      RiotControl.off('item_current_getCache_done', this.refreshCache);
    });
  </script>
</cache-nosql-editor>
