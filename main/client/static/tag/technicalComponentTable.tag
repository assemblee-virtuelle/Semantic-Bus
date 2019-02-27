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
    
    <zentable ref="technicalComponentTable" disallowdelete={true} disallownavigation={true}>
      <yield to="row">
        <img class="rowImg"src={'image/components/'+ graphIcon}/>
        <div>
          <div class="tableRowName">{type}</div>
          <div class="tableRowDescription">{description.slice(0,50)}...</div>
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

    this.isTagInSelectedTags = function (item) {
      let out = false;

      out = sift({
        '@id': item['@id']
      }, this.selectedTags).length > 0;

      return out;
    }

    this.addComponentClick = function (e) {
      RiotControl.trigger("workspace_current_add_components")
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

    this.updateComponentsByTags = function () {
      if (this.selectedTags.length > 0) {
        this.tags.zentable.data = sift({
          'tags': {
            $all: this.selectedTags.map(t => t['@id'])
          }
        }, this.rawData);

      } else {
        this.tags.zentable.data = this.rawData;

      }
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
      width: 100%;
      padding: 1vh;
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
      height: 2vh;
      width: 100%;
    }
    .containerValidate {
      position: absolute;
      bottom: 1vh;
    }
    .rowImg {
      height: 3vh;
      width: 3vh;
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
      padding:3px;
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
