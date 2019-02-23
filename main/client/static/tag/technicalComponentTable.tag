<technical-component-table class="containerV" style="flex-grow:1;">

    <!-- tableau des composants -->
    <div class="containerH" style="flex-shrink:0;padding:10px">
      <div class="containerH" style="flex-grow:1;justify-content: center;">
        <div each={item in firstLevelCriteria} class={commandButton:true,tagSelected:isTagInSelectedTags(item)} onclick={firstLevelCriteriaClick}>
          {item['skos:prefLabel']}
        </div>
      </div>
    </div>
    <div class="containerH"style="flex-shrink:0;padding:10px">
      <div class="containerH" style="flex-grow:1;justify-content: center;">
        <div each={item in secondLevelCriteria} class={commandButton:true,tagSelected:isTagInSelectedTags(item)} onclick={secondLevelCriteriaClick}>
          {item['skos:prefLabel']}
        </div>
      </div>
    </div>

    <zentable style="flex:1" ref="technicalComponentTable" disallowdelete={true} disallownavigation={true}>
      <yield to="header">
        <div class="containerTitle">
          <div class="tableTitleName">COMPOSANT</div>
          <div class="tableTitleDescription">DESCRIPTION</div>
          <div class="tableEmpty"/>
        </div>
      </yield>
      <yield to="row">
        <div class="tableRowName"> <img class="rowImg"src={'image/components/'+ graphIcon}/> {type}</div>
        <div class="tableRowDescription">{description.slice(0,100)}</div>
      </yield>
    </zentable>

    <!-- Bouton valider -->
    <div class="containerH" style="padding-top:20px;flex-basis:45px;justify-content: center;align-items: flex-start; flex-shrink:0;flex-grow:0;">
      <img onclick={addComponentClick} class="commandButtonImage btnAddSize" src="./image/check.png" title="Valider la sélection">
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
    .rowImg {
      height: 3vh;
      width: 3vh;
      margin-right: 1vh;
    }
    .tableRowName {
      font-size: 0.85em;
      flex: 0.3;
      padding: 10px;
      justify-content: flex-start;
      display: flex;
      align-items: center;
    }
    .tableRowDescription {
      font-size: 0.85em;
      flex:0.695;
      padding: 10px;
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
