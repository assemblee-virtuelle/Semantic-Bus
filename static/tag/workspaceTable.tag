<workspace-table class="containerV scrollable">
  <zenTable style="flex:1;background-color: rgb(238,242,249);" drag={false}  clickClass={false} disallownavigation={true} disallowdelete={true} ref="workspaceZenTable">
    <yield to="header">
      <div>Name</div>
      <div>Description</div>
    </yield>
    <yield to="row">
      <div style="width:40%" >{name}</div>
      <div style="width:50%">{description}</div>
    </yield>
  </zenTable>

  <script>

    this.refreshZenTable = function (data) {
      console.log("refreshZenTable", data)
      this.tags.zentable.data = data;
      this.data = data
    }.bind(this);


    this.filterSearch = function(e){
      if(e.code == "Backspace"){
        this.tags.zentable.data = this.data
        this.tags.zentable.data = sift({name: {$regex: re}  }, this.tags.zentable.data);
      }
      let test = $(".champ")[0].value
      var re = new RegExp(test, 'gi');
      this.tags.zentable.data = sift({name: {$regex: re}  }, this.tags.zentable.data);
      this.update()
    }.bind(this)

    this.addRow = function () {
        RiotControl.trigger('workspace_current_init');
    }.bind(this)


    this.on('mount', function (args) {
      this.tags.zentable.on('rowNavigation', function (data) {
        RiotControl.trigger('workspace_current_select', data);
      }.bind(this));
      RiotControl.on("store_filterCards", this.filterSearch)
      RiotControl.on('store_addRowWorkspace',this.addRow);
      this.tags.zentable.on('delRow', function (data) {
        RiotControl.trigger('workspace_delete', data);
      }.bind(this));
      RiotControl.on('workspace_collection_changed', this.refreshZenTable);
      RiotControl.trigger('workspace_collection_load');
    });

    this.on('unmount', function () {
      RiotControl.off('store_addRowWorkspace', this.addRow )
      RiotControl.off("store_filterCards", this.filterSearch)
      RiotControl.off('workspace_collection_changed', this.refreshZenTable);
    })
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
