<!--  PAGE WORKFLOW  -->
<workspace-table class="containerV" style="flex-grow:1">
<!-- Barre de recherche -->
    <div class="containerH" style="height:80px;justify-content: center; align-items: center;flex-shrink:0;">
      <input class="searchbox" type="text" name="inputSearch" ref="inputSearch" placeholder="Rechercher" onkeyup={filterCards}/></div>
<!-- Tableau de WorkFlow -->
  <zenTable style="background-color: rgb(213,218,224)" show={!isEmpty}  drag={false} disallowselect={true} ref="workspaceZenTable">
<!-- nom des colonnes -->
    <yield to="header">
      <div style="margin-left: 50px;width:40%">Nom</div>
      <div style="width:60%">Description</div>
    </yield>
<!-- contenu des colonnes -->
    <yield to="row">
      <div style="width:40%" >{name}</div> <!-- police a modifier ! -->
      <div style="width:60%; word-break: normal;">{description}</div> <!-- police a modifier ! -->
    </yield>
  </zenTable>

<!-- Tableau si vide -->
    <div if={isEmpty} class="containerH" style="flex-grow:1;justify-content:center;background:rgb(213,218,224)"><!--rgb(238,242,249)-->
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">

      <h1 style="text-align: center;color: rgb(119,119,119);">
        Aucun WorkFlow trouvé !
        Cliquer sur le bouton "+" pour en créer un.
      </h1>
    </div>
  </div>
<!--dockfooter-->
  <div class="containerU" style="height:85px;justify-content: center;">
    <div onclick={addWorkflowClick} class="commandButtonImage containerV">
      <img src="./image/ajout_composant.svg" style="" height="40px" width="40px">
      <span style="font-family: 'Open Sans', sans-serif";>Workflow</span>
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
