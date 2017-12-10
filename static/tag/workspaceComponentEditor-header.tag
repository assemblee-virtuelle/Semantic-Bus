<workspace-component-editor-header class="containerH" style="flex-wrap:nowrap;flex-grow:1">

  <div class="commandBar containerH" style="flex-grow:1">
    <div></div>
    <div class="containerV">
      <div class="containerH">
        <div>
          Editer votre composant
        </div>
      </div>
    </div>

    <div style="flex-basis:100px;flex-grow:0;flex-shrink:0">
      <div onclick={saveClick} class="commandButtonImage containerV">
        <img src="./image/Super-Mono-png/PNG/sticker/icons/inbox.png" style="" height="40px" width="40px">
        <div>valider</div>
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
