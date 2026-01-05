<technical-component-table class="mainContainerListGraph">

    <!-- tableau des composants -->
    <div class="containerFilter">
      <div class="containerH cardFilter">
        <div each={item in firstLevelCriteria} class={commandButton:true,tagSelected:isTagInSelectedTags(item)} onclick={firstLevelCriteriaClick}>
          {item['skos:prefLabel']}
        </div>
      </div>
      <div class="containerH cardFilter">
        <div each={item in secondLevelCriteria} class={commandButton:true,tagSelected:isTagInSelectedTags(item)} onclick={secondLevelCriteriaClick}>
          {item['skos:prefLabel']}
        </div>
      </div>
    </div>
    
    <!-- Search input for filtering components by name -->
    <div class="containerH searchContainer">
      <input 
        type="text" 
        ref="searchInput"
        class="searchInput" 
        placeholder="Rechercher un composant..." 
        oninput={onSearchInput}
      />
      <img if={searchText} onclick={clearSearch} src="./image/cross.svg" class="clearSearchBtn" title="Effacer la recherche"/>
    </div>
    
    <zentable ref="technicalComponentTable" dragout={true} disallowdelete={true} disallownavigation={true}>
      <yield to="row">
        <div>
          <img class="rowImg" src={'image/components/'+ graphIcon} draggable="false"/>
        </div>
        <div>
          <div class="tableRowName">{type}</div>
          <div class="tableRowDescription">{description}</div>
        </div>
      </yield>
    </zentable>
    <div style="height: 10vh"/>
    <!-- Bouton valider -->
    <div class="containerH containerValidate">
      <div onclick={addComponentClick} class="btnFil commandButtonImage">
        Ajouter
        <img class="imgFil" src="./image/ajout_composant.svg" title="Importer un Workflow">
        <input onchange={import} ref="import" type="file" style="display:none;"/>
      </div>
      
    </div>

  <script>
    this.data = {};

    //this.actionReady = false;
    this.firstLevelCriteria = [];
    this.secondLevelCriteria = [];
    this.selectedTags = [];
    this.rawData = [];
    this.searchText = '';

    this.isTagInSelectedTags = function (item) {
      let out = false;

      out = sift({
        '@id': item['@id']
      }, this.selectedTags).length > 0;

      return out;
    }

    this.addComponentClick = (e) => {
      RiotControl.trigger("workspace_current_add_components",{graphPositionX:0,graphPositionY:0})
    }

    this.onSearchInput = (e) => {
      this.searchText = e.target.value.toLowerCase();
      this.applyFilters();
    }

    this.clearSearch = () => {
      this.searchText = '';
      this.refs.searchInput.value = '';
      this.applyFilters();
    }

    firstLevelCriteriaClick(e) {

      let everSelected = this.isTagInSelectedTags(e.item.item);
      this.selectedTags = [];
      this.secondLevelCriteria = [];
      if (!everSelected) {
        this.secondLevelCriteria = sift({
          broader: e.item.item['@id']
        }, this.ComponentsCategoriesTree['@graph']);
        this.selectedTags.push(e.item.item);
      }
      this.updateComponentsByTags();
    }

    secondLevelCriteriaClick(e) {
      let everSelected = this.isTagInSelectedTags(e.item.item);
      this.selectedTags = sift({
        broader: {
          $exists: false
        }
      }, this.selectedTags)
      if (!everSelected) {
        this.selectedTags.push(e.item.item);
      }
      this.updateComponentsByTags();
    }

    this.applyFilters = function () {
      let filteredData = this.rawData;

      // Filter by selected tags
      if (this.selectedTags.length > 0) {
        filteredData = sift({
          'tags': {
            $all: this.selectedTags.map(t => t['@id'])
          }
        }, filteredData);
      }

      // Filter by search text
      if (this.searchText && this.searchText.trim() !== '') {
        const searchLower = this.searchText.toLowerCase();
        filteredData = filteredData.filter(component => {
          const typeName = (component.type || '').toLowerCase();
          const description = (component.description || '').toLowerCase();
          return typeName.includes(searchLower) || description.includes(searchLower);
        });
      }

      this.tags.zentable.data = filteredData;
      this.update();
    }

    this.updateComponentsByTags = function () {
      this.applyFilters();
    }

    this.updateData = function (dataToUpdate) {
      this.tags.zentable.data = dataToUpdate;
      this.rawData = dataToUpdate;
      this.update();
    }.bind(this);

    this.updateComponentsCategoriesTree = function (tree) {
      this.ComponentsCategoriesTree = tree;
      this.firstLevelCriteria = sift({
        broader: {
          $exists: false
        }
      }, tree['@graph']);
      this.update();
    }.bind(this);


    this.on('mount', function () {
      this.actionReady = false;
      this.tags.zentable.on('rowsSelected', function (selecetedRows) {
        RiotControl.trigger('set_componentSelectedToAdd', selecetedRows);
      }.bind(this));
      RiotControl.on('technicalComponent_collection_changed', this.updateData);
      RiotControl.on('add_component_button_select', this.addComponent)
      RiotControl.on('componentsCategoriesTree_changed', this.updateComponentsCategoriesTree);
      RiotControl.trigger('componentsCategoriesTree_refresh');
      RiotControl.trigger('technicalComponent_collection_load');

    });

    this.on('unmount', function () {
      RiotControl.off('technicalComponent_collection_changed', this.updateData);
      RiotControl.off('add_component_button_select', this.addComponent)
      RiotControl.off('componentsCategoriesTree_changed', this.updateComponentsCategoriesTree);
    });
  </script>
  <style>
    .rowContainer {
      width: 100%;
    }
    .tableRowContent {
      justify-content: start;
      flex: 1;
    }
    .containerV {
      width: 100%;
    }
    .tableRow {
      border-color: transparent;
      border-top-width: 2px;
      border-top-color: rgb(238,242,249);
      border:none!important;
      width: 100%;
      padding: 1vh;
      cursor: pointer
    }
    .technical-component-table {
      overflow: visible;
      width: 100%;
    }
    .mainContainerListGraph {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: 100%;
    }
    .cardFilter {
      flex-wrap: wrap;
      justify-content: space-evenly;
      padding: 1vh;
      align-items: center;
    }
    .dropTarget {
      flex-basis: 0px;
    }
    .containerFilter {
      width: 100%;
    }
    .searchContainer {
      width: 90%;
      padding: 0.5vh 1vh;
      position: relative;
      align-items: center;
      margin-bottom: 1vh;
    }
    .searchInput {
      width: 100%;
      padding: 8px 30px 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .searchInput:focus {
      border-color: rgb(26,145,194);
    }
    .searchInput::placeholder {
      color: #aaa;
    }
    .clearSearchBtn {
      position: absolute;
      right: 2vh;
      width: 16px;
      height: 16px;
      cursor: pointer;
      opacity: 0.6;
    }
    .clearSearchBtn:hover {
      opacity: 1;
    }
    .containerValidate {
      position: absolute;
      bottom: 1vh;
    }
    .rowImg {
      height: 25px !important;
      width: 25px !important;
      padding: 1vh;
    }
    .tableRowName {
      font-weight: 400;
      font-family: sans-serif;
      justify-content: flex-start;
      font-size: 15px;
      padding:1vh;
    }
    .selected {
      background-color: rgba(33, 150, 243,0.1) !important;      
      border-top-color: rgba(33, 150, 243,0.1) !important;
      border-top-width: 2px !important;
      border: none !important;
    }
    .tableRowDescription { 
      font-weight: 200;
      font-family: sans-serif;
      font-size: 10px;
      padding-right: 2vw;
      padding-left: 1vw;
    }

    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleName {
      font-size: 0.85em;
      flex:0.26;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableTitleDescription {
      font-size: 0.85em;
      flex:0.595;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableEmptyImg {
      flex:0.05;
    }
    .tableEmpty {
      flex:0.15;
    }
  </style>
</technical-component-table>
