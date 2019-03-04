<workspace-component-editor-header class="containerH" style="flex-wrap:nowrap;flex-grow:1">
  <!-- header éditer un composant -->
  <div class="commandBar containerH" style="flex-grow:1; justify-content: center">
    <div></div>
    <div class="containerV" style="justify-content:center">
      <div class="containerH">
        <div class="main-title">
          <h6 style="font-weight: 400">Paramètre du composant</h6>
        </div>
      </div>
    </div>
  </div>

  <style></style>
  <script>
    this.data = {};

    this.saveClick = function (e) {
      RiotControl.trigger('item_current_persist');
      //route('workspace/new/information')
    }

    this.on('mount', function () {});

    this.on('unmount', function () {});
  </script>
</workspace-component-editor-header>
