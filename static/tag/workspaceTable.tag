<!--  PAGE WORKFLOW  -->
<workspace-table class="containerV" style="flex-grow:1">
<!-- Barre de recherche -->
    <div class="containerH" style="height:80px;justify-content: center; align-items: center;flex-shrink:0;">
      <input class="searchbox" type="text" name="inputSearch" ref="inputSearch" placeholder="Rechercher" onkeyup={filterCards}/></div>
<!-- Tableau de WorkFlow -->
  <zenTable show={!isEmpty}  drag={false} disallowselect={true} ref="workspaceZenTable">
    <yield to="header">
      <div class="table-title" style="margin-left: 50px;width: 200px;flex-grow:1">Nom</div>
      <div class="table-title" style="margin-right: 60px;width: 500px;flex-grow:1">Description</div>
    </yield>
    <yield to="row">
      <div style="flex-grow:1;width: 200px;">{name}</div>
      <div style="flex-grow:1;width: 500px; word-break: normal;">{description}</div>
    </yield>
  </zenTable>

<!-- Tableau si vide -->
    <div if={isEmpty} class="containerH" style="flex-grow:1;justify-content:center;">
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">

      <h1 style="text-align: center;color: rgb(119,119,119);">
        Cliquer sur le bouton "+" pour en créer un Worklow.
      </h1>
    </div>
  </div>
<!--dockfooter-->
  <div class="containerV" style="flex-basis: 45px;justify-content: flex-start;;flex-grow:0;flex-shrink:0">
    <div onclick={addWorkflowClick} class="commandButtonImage containerV"style="flex-grow:0;flex-shrink:0">
      <img src="./image/ajout_composant.svg" title="Créer un Workflow" height="40px" width="40px">
    </div>
  </div>
<!-- Tableau si non vide -->
  <script>
//------------------------------------------------------------------------------------------------
  //search
      this.data = {};

      this.filterCards = function (e) {
        console.log(this.refs.inputSearch.value);
        RiotControl.trigger('workspace_collection_filter',this.refs.inputSearch.value);
      }
  //Ajouter un workflow
      this.addWorkflowClick = function (e) {
        route('workspace/new/information')
      }

//------------------------------------------------------------------------------------------------
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
/*barre de recherche*/
    .searchbox
{
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
</workspace-table>
