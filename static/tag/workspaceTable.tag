<workspace-table class="containerV containerV-scrollale">
  <zenTable style="flex:1" drag={false} disallowselect={true} ref="workspaceZenTable">
    <yield to="header">
      <div>Name</div>
      <div>Description</div>
    </yield>
    <yield to="row">
      <div style="width:29%" >{name}</div>
      <div style="width:70%">{description}</div>
    </yield>
  </zenTable>

  <script>

    this.refreshZenTable = function (data) {
      console.log("refreshZenTable")
      this.tags.zentable.data = data;
      this.data = data
    }.bind(this);

    this.on('unmount', function () {
      RiotControl.off('workspace_collection_changed', this.refreshZenTable);
    });

    this.on('mount', function (args) {
      this.tags.zentable.on('rowNavigation', function (data) {
        console.log("rowNavigation", data);
        RiotControl.trigger('workspace_current_select', data);
      }.bind(this));

      RiotControl.on("filterCards", function(e){
        console.log("in filtercard trigger")
        if(e.code == "Backspace"){
          this.tags.zentable.data = this.data
          this.tags.zentable.data = sift({name: {$regex: re}  }, this.tags.zentable.data);
        }
        let test = $(".champ")[0].value
        var re = new RegExp(test, 'gi');
        this.tags.zentable.data = sift({name: {$regex: re}  }, this.tags.zentable.data);
        this.update()
      }.bind(this))

      RiotControl.on('addRowWorkspace', function () {
        RiotControl.trigger('workspace_current_init');
      }.bind(this));

      this.tags.zentable.on('delRow', function (data) {
        RiotControl.trigger('workspace_delete', data);
      }.bind(this));

      RiotControl.on('workspace_collection_changed', this.refreshZenTable);

      RiotControl.trigger('workspace_collection_load');

      //this.refresh();

    });
  </script>
  <style>
    .champ {
      color: rgb(220,220,220);
      width: 50vw;
      height: 60px;
      border-radius: 20pt;
      border-width: 0;
      font-size: 1em
    }
  </style>
</workspace-table>
