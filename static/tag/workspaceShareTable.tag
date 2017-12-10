<workspace-share-table class="containerV">

  <zenTable if={!isEmpty} drag={false} disallowselect={true} style="background-color: rgb(238,242,249);">
    <yield to="header">
      <div>Name</div>
      <div>Description</div>
    </yield>
    <yield to="row">
      <div style="width:30%">{name}</div>
      <div style="width:70%">{description}</div>
    </yield>
  </zenTable>
  <div if={isEmpty} class="containerH" style="flex-grow:1;justify-content:center;">
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">

      <h1 style="text-align: center;color: rgb(119,119,119);">
        Vous n'avez pas encore de workspaces partagés, ils apparaitront si d'autres utilisateurs decident de vous partager leurs workspaces
      </h1>
    </div>
  </div>
  <script>

    this.isEmpty = true

    //console.log('mount opts :',this.opts);
    this.refreshZenTableShare = function (data) {
      console.log('view UPDATE refreshZenTableShare', data);
      if (data.length > 0) {
        this.isEmpty = false
        this.tags.zentable.data = data;
      } else {
        this.isEmpty = true
      }
      this.update()
    }.bind(this);

    this.on('mount', function (args) {

      RiotControl.on("filterCards", function (e) {
        console.log("in filtercard trigger")
        if (e.code == "Backspace") {
          this.tags.zentable.data = this.data
          this.tags.zentable.data = sift({
            name: {
              $regex: re
            }
          }, this.tags.zentable.data);
        }
        let test = $(".champ")[0].value
        var re = new RegExp(test, 'gi');
        this.tags.zentable.data = sift({
          name: {
            $regex: re
          }
        }, this.tags.zentable.data);
        this.update()
      }.bind(this))

      this.tags.zentable.on('rowNavigation', function (data) {
        //console.log("rowNavigation", data); RiotControl.trigger('workspace_current_select', data);
        route('workspace/' + data._id + '/component');
      }.bind(this));

      RiotControl.on('workspace_share_collection_changed', this.refreshZenTableShare);

      RiotControl.trigger('workspace_collection_share_load');

      //this.refresh();
    });
    this.on('unmount', function (args) {

      RiotControl.off('workspace_share_collection_changed', this.refreshZenTableShare);

    });
  </script>
  <style>
    .champ {
      color: rgb(220,220,220);
      width: 50vw;
      height: 38px;
      border-radius: 20pt;
      border-width: 0;
      font-size: 1em;
    }

  </style>
</workspace-share-table>
