<workspace-table class="containerH" style="flex-grow:1">
  <zenTable show={!isEmpty}  drag={false} disallowselect={true} ref="workspaceZenTable">
    <yield to="header">
      <div style="width:40%">Name</div>
      <div style="width:60%">Description</div>
    </yield>
    <yield to="row">
      <div style="width:40%" >{name}</div>
      <div style="width:60%; word-break: normal;">{description}</div>
    </yield>
  </zenTable>

    <div if={isEmpty} class="containerH" style="flex-grow:1;justify-content:center;background:rgb(238,242,249)">
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">

      <h1 style="text-align: center;color: rgb(119,119,119);">
        Vous n'avez pas encore crée de workflow , Vous n'avez plus qu'a en créer un, ca ce passe en haut a droite
      </h1>
    </div>
  </div>

  <script>
    this.isEmpty = false
    this.refreshZenTable = function (data) {
      console.log("refreshZenTable", data)
      if (data.length > 0) {
        this.isEmpty = false
        this.tags.zentable.data = data;
        this.data = data
      } else {
        this.isEmpty = true
      }
      this.update();
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
        console.log("rowNavigation", data);
        //RiotControl.trigger('workspace_current_select', data);
        route('workspace/' + data._id + '/component');
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
