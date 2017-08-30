<cache-nosql-editor>

  <!--<div class="containerH commandBar" style="flex-basis:50px">
    <div class="commandGroup containerH">
      <div onclick={reloadCacheClick} class="commandButton">
        reload cache
      </div>
      <div onclick={getCacheClick} class="commandButton">
        get cache
      </div>
    </div>
  </div> - -->
  <div>mettre en cache les data et les réintéroger</div>
  <jsonEditor name="cachedData" mode="text" style="flex-grow:1">
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

    this.on('mount', function () {

      RiotControl.on('item_current_changed', function (data) {
        this.innerData = data;

        this.update();
      }.bind(this));
      RiotControl.on('item_current_getCache_done', function (data) {
        //this.cahedData = data;
        this.tags.cachedData.data = data;
        this.update();
      }.bind(this));
      RiotControl.trigger('item_current_getCache');
    });
  </script>
</cache-nosql-editor>
