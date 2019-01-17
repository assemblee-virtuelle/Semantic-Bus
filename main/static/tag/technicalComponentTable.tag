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
        <div class="table-title" style="margin-left: 50px;width: 200px;flex-grow:1">Composant</div>
        <div class="table-title" style="margin-right:60px;width: 500px;flex-grow:1">Description</div>
      </yield>
      <yield to="row">
        <div style="width: 200px;flex-grow:1">{type}</div>
        <div style="width: 500px;flex-grow:1">{description}</div>
      </yield>
    </zentable>

    <!-- Bouton valider -->
    <div class="containerH" style="padding-top:20px;flex-basis:45px;justify-content: center;align-items: flex-start; flex-shrink:0;flex-grow:0;">
      <div onclick={addComponentClick} class="commandButtonImage">
        <img src="./image/check.png" title="Valider la sélection" height="35px" width="35px">
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

      //console.log('isScrennToShow',screenToTest,out, this.screenHistory);
      return out;
    }

    this.addComponentClick = function (e) {
      console.log("clic sauve")
      RiotControl.trigger("workspace_current_add_components")
    }

    firstLevelCriteriaClick(e) {
      //console.log(e); console.log(e.item.item['@id']);

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
      //console.log(e); console.log(e.item.item['@id']); this.secondLevelCriteria = sift({   broader:e.item.item['@id'] }, this.ComponentsCategoriesTree['@graph']);
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

    // refreshTechnicalComponents(data) {   console.log('technicalCompoents | this.refs |', this.refs);   this.tags.zentable.data = data;
    //
    // }

    this.updateComponentsByTags = function () {
      console.log(this.rawData);
      console.log(this.selectedTags.map(t => t['@id']));
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
      console.log(this.firstLevelCriteria);
      this.update();
    }.bind(this);

    // this.addComponent = function(){   console.log("In technical components",this.tags)     RiotControl.trigger('workspace_current_add_components', sift({       selected: {         $eq: true       }     }, this.tags.zentable.data)   ) }.bind(this)

    this.on('mount', function () {
      this.actionReady = false;
      this.tags.zentable.on('rowsSelected', function (selecetedRows) {
        RiotControl.trigger('set_componentSelectedToAdd', selecetedRows);
      }.bind(this));
      // this.tags.zentable.on('addRow', function () {   console.log(data);   RiotControl.trigger('technicalComponent_current_init'); }.bind(this)); this.tags.zentable.on('delRow', function (data) {   console.log(data);
      // RiotControl.trigger('technicalComponent_delete', data);
      //
      // }.bind(this)); this.tags.zentable.on('cancel', function (data) {   console.log(data);   RiotControl.trigger('workspace_current_add_component_cancel');
      //
      // }.bind(this));
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
    .notSynchronized {
      background-color: orange !important;
      color: white;
    }
    //TODO migrate ti zentable tag
    .zentableScrollable {
      padding: 10pt;
      align-items: stretch;
      background-color: rgb(240,240,240);
      overflow: scroll;
    }
  </style>
</technical-component-table>
