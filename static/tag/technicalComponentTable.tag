<technical-component-table class="containerV">
  <div class="commandBar containerH" style="height: 100pt;
    /* text-align: center; */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(33,150,243);
    color:white">
    <div>Add Componnent</div>
    <div class="containerH commandGroup"  if={actionReady}>
          <image  style="margin-left: -1px;
          margin-top: 7vh;
          color: white;
          position: absolute;
          margin-left: 35vw;  cursor: pointer;" src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addComponent}></image>
    </div>
  </div>
  <div class="commandBar containerH">
    <div class="containerH commandGroup" style="flex-grow:1">
      <div each={item in firstLevelCriteria} class={commandButton:true,tagSelected:isTagInSelectedTags(item)} onclick={firstLevelCriteriaClick}>
        {item['skos:prefLabel']}
      </div>
    </div>
  </div>
  <div class="commandBar containerH">
    <div class="containerH commandGroup" style="flex-grow:1">
      <div each={item in secondLevelCriteria} class={commandButton:true,tagSelected:isTagInSelectedTags(item)} onclick={secondLevelCriteriaClick}>
        {item['skos:prefLabel']}
      </div>
    </div>
  </div>

  <zenTable style="flex:1" ref="technicalComponentTable" disallowdelete={false} disallownavigation={false}>
    <yield to="header">
      <div>type</div>
      <div>description</div>
    </yield>
    <yield to="row">
      <div style="width:30%">{type}</div>
      <div style="width:70%">{description}</div>
    </yield>
  </zenTable>

  <script>

    this.actionReady = false;
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

    addComponent(e) {
      //this.tags.zentable.data.forEach(record=>{  if(record.selected){
      RiotControl.trigger('workspace_current_add_components', sift({
        selected: {
          $eq: true
        }
      }, this.tags.zentable.data));

      //RiotControl.trigger('back');  } });
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

    this.on('mount', function () {
      this.actionReady=false;
      this.tags.zentable.on('rowSelect',function(){
        console.log('ROWSELECTD',  this.actionReady);
        this.actionReady=true;
        this.update();
      }.bind(this));
      this.tags.zentable.on('addRow', function () {
        //console.log(data);
        RiotControl.trigger('technicalComponent_current_init');
      }.bind(this));

      this.tags.zentable.on('delRow', function (data) {
        //console.log(data);
        RiotControl.trigger('technicalComponent_delete', data);

      }.bind(this));
      this.tags.zentable.on('cancel', function (data) {
        //console.log(data);
        RiotControl.trigger('workspace_current_add_component_cancel');

      }.bind(this));
      RiotControl.on('technicalComponent_collection_changed', this.updateData);
      RiotControl.on('componentsCategoriesTree_changed', this.updateComponentsCategoriesTree);
      RiotControl.trigger('componentsCategoriesTree_refresh');
      RiotControl.trigger('technicalComponent_collection_load');

    });

    this.on('unmount', function () {
      RiotControl.off('technicalComponent_collection_changed', this.updateData);
      RiotControl.off('componentsCategoriesTree_changed', this.updateComponentsCategoriesTree);
    });
  </script>
  <style>
    .notSynchronized {
      background-color: orange !important;
      color: white;
    }

    .tagSelected {
      border: 3px solid rgb(9,245,185)!important;
      background-color: rgb(9,245,185);
      color:white;
    }

  </style>
</technical-component-table>
