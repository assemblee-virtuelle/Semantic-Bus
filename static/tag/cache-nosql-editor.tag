<cache-nosql-editor>

  <div class="containerH commandBar" style="flex-basis:50px">
    <div class="commandGroup containerH">
      <div onclick={reloadCacheClick} class="commandButton">
        reload cache
      </div>
    </div>
  </div>
  <div>mettre en cache les data et les réintoriger</div>
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

    this.on('mount', function () {

      RiotControl.on('item_current_changed', function (data) {
        this.innerData = data;

        this.update();
      }.bind(this));
    });
  </script>
</cache-nosql-editor>
