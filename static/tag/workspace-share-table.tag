<workspace-share-table class="containerV">
  <div class="commandBar containerH">
    Shared Workspaces
  </div>
  <zenTable  drag={false} style="flex:1" disallowcommand="true">
    <yield to="header">
      <div>name</div>
      <div>description</div>
    </yield>
    <yield to="row">
      <div style="width:30%">{name}</div>
      <div style="width:70%">{description}</div>
    </yield>
  </zenTable>

  <script>
    //console.log('mount opts :',this.opts);
    this.refreshZenTableShare = function (data) {
      console.log('view UPDATE', data);
      this.tags.zentable.data = data;
    }.bind(this);
    this.on('mount', function (args) {
      //console.log('mount argr :',opts);
      this.tags.zentable.on('rowNavigation', function (data) {
        //console.log(data);
        RiotControl.trigger('workspace_current_select', data);
        //this.trigger('selectWorkspace');
      }.bind(this));

      RiotControl.on('workspace_share_collection_changed', this.refreshZenTableShare);

      RiotControl.trigger('workspace_collection_share_load');

      //this.refresh();
    });
    this.on('unmount', function (args) {

      RiotControl.off('workspace_share_collection_changed', this.refreshZenTableShare);

    });
  </script>
  <style></style>
</workspace-share-table>
