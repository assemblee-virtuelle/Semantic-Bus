<workspace-editor-header class="containerH" style="flex-wrap:nowrap;flex-grow:1">
  <div class="commandBar containerH" style="flex-grow:1; justify-content: center">
    <div class="containerV" style="justify-content:center">
      <div class="containerH">
        <div class="main-title">
          <h6>{data.name}</h6>
        </div>
      </div>
    </div>
  </div>

  <style></style>
  <script>
    this.data = {};

    this.persistClick = function (e) {
      RiotControl.trigger('workspace_current_persist')
    }.bind(this)

    this.showAddComponentClick = function (e) {
      route('workspace/' + this.data._id + '/addComponent');
    }.bind(this)

    this.showShareClick = function (e) {
      route('workspace/' + this.data._id + '/share');
    }.bind(this)

    this.addComponentClick = function (e) {
      RiotControl.trigger("workspace_current_add_components")
    }

    this.shareClick = function (e) {
      RiotControl.trigger('share-workspace');
    }

    RiotControl.on('workspace_editor_menu_changed', function (menu) {
      this.menu = menu;
      this.update();
    }.bind(this));

    this.workspaceCurrentChanged = function (data) {
      this.data = data;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.trigger('workspace_current_refresh');
    });

    this.on('unmount', function () {
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
    });
  </script>
</workspace-editor-header>
