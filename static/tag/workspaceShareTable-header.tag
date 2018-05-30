<workspace-share-table-header class="containerH" style="flex-wrap:nowrap;flex-grow:1">

  <div class="commandBar containerH" style="flex-grow:1">
    <div></div>
    <div class="containerV">
      <div class="containerH">
        <div class="main-title">
          mes WorkFlow Partagés
        </div>
      </div>
      <div class="containerH">
        <div><input class="champ" type="text" name="inputSearch" ref="inputSearch" placeholder="Search" onkeyup={filterCards}/></div>
      </div>
    </div>

    <div style="flex-basis:100px;flex-grow:0;flex-shrink:0">

    </div>
  </div>

  <style></style>
  <script>
    this.data = {};

    this.filterCards = function (e) {
      console.log(this.refs.inputSearch.value);
      RiotControl.trigger('workspace_share_collection_filter',this.refs.inputSearch.value);
    }

    this.on('mount', function () {
    });

    this.on('unmount', function () {
    });
  </script>
</workspace-share-table-header>
