<!-- Worklow partagé -->
<workspace-share-table class="containerV" style="flex-grow:1">
  <!-- Barre de recherche -->
  <div class="containerH" style="height:80px;justify-content: center; align-items: center;flex-shrink:0;">
    <input class="searchbox" type="text" name="inputSearch" ref="inputSearch" placeholder="Rechercher" onkeyup={filterCards}/></div>
  <!-- Tableau de WorkFlow partagé -->
  <zentable show={!isEmpty} drag={false} disallowselect={true} style="background-color: rgb(238,242,249);">
    <!-- nom des colonnes -->
    <yield to="header">
      <div class="table-title" style="margin-left: 50px;width: 200px;flex-grow:1">Nom</div>
      <div class="table-title" style="margin-right: 60px;width: 500px;flex-grow:1">Description</div>
    </yield>
    <yield to="row">
      <div style="flex-grow:1;width: 200px;">{name}</div>
      <div style="flex-grow:1;width: 500px; word-break: normal;">{description}</div>
    </yield>
  </zentable>
  <div if={isEmpty} class="containerH" style="flex-grow:1;justify-content:center;">
    <div class="containerV"  style="flex-basis:1;justify-content:center;margin:50px">

      <h1 style="text-align: center;color: rgb(119,119,119);">
        Vous n'avez pas de Workflow partagé.
      </h1>
    </div>
  </div>

  <script>
    //search
    this.data = {};

    //search
    /*  this.data = {};

      filterCards (e) {
        RiotControl.trigger('workspace_collection_filter',this.refs.inputSearch.value);
      }

/* si Tableau vide */
    this.isEmpty = false

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
      //Search
      /*  RiotControl.on("filterCards", function (e) {
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
      }.bind(this)) */

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
    /*barre de recherche*/
    .searchbox {
      background-color: #ffffff;
      background-image: linear-gradient(#fff, #f2f3f5);
      border-radius: 35px;
      border-width: 1px;
      border-style: solid;
      border-color: rgb(213,218,224);
      width: 300px;
      height: 35px;
    }
  </style>
</workspace-share-table>
