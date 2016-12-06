<navigation>
  <div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute;">

    <div show={modeNavigation} class="containerH" style="flex-grow:1">
      <div class="containerV" style="flex-basis:20%">
        <div name="workspaceSelector" class="selector mainSelector" style="flex-basis:100px"><div>Workspace</div></div>
        <div name="technicalComponentSelector" class="selector mainSelector" style="flex-basis:100px"><div>Composant Technique</div></div>
      </div>
      <div id="contentNavigator" style="flex-basis:30%">

      </div>
      <div style="flex-grow:1" id="detailContainer">

      </div>

    </div>
    <div style="flex-grow:1" class="containerV" show={modeEdition}>
      <div class="containerH commandBar" style="flex-basis:50px">
        <div class="commandGroup" class="containerH">
        </div>
        <div class="commandTitle">
          {editorTitle}
        </div>
        <div class="commandGroup containerH">
          <div onclick={nagivationClick} class="commandButton">
            back to navigation
          </div>
          <div onclick={testPullClick} class="commandButton">
            tester un flux tiré
          </div>
          <div onclick={saveEditionContainerClick} class={ commandButton: true, persistInProgress: persistInProgress } name="saveButton">
            save
          </div>
        </div>
      </div>
      <div  style="flex-grow:1;flex-wrap: nowrap" class="containerH">
        <div style="flex-basis:200px" class="containerV" show={modeComponentNetwork}>
          <div class="containerH commandBar" style="flex-basis:50px">
            <div class="commandGroup containerH">
              <div onclick={connectBeforeClick} class="commandButton">
                connect before
              </div>
            </div>
          </div>
          <div onclick={navigateWorkspaceComponentClick} class="selector" each={itemCurrent.connectionsBefore}>
            {type} : {name}
          </div>
        </div>
        <div id="editionContainer" style="flex-grow:1" class="containerV">
        </div>
        <div show={modeComponentTest} style="flex-grow:2;flex-wrap: nowrap;" class="containerH">
          <!--<jsonPreviewer name="testPreviewer" style="flex-grow:1">
        </jsonPreviewer>-->
          <div class="containerV commandBar" style="flex-basis:50px">
            <div></div>
            <div class="commandGroup" class="containerH">

              <div onclick={closeTest} class="commandButton">
                >
              </div>

            </div>
            <div></div>
          </div>

          <jsonEditor name="testPreviewer" mode="text" style="flex-grow:1"></jsonEditor>

        </div>
        <div style="flex-basis:200px" class="containerV" show={modeComponentNetwork}>
          <div class="containerH commandBar" style="flex-basis:50px">
            <div class="commandGroup containerH">
              <div onclick={connectAfterClick} class="commandButton">
                connect after
              </div>
            </div>
          </div>
          <div onclick={navigateWorkspaceComponentClick} class="selector" each={itemCurrent.connectionsAfter}>
            {type} : {name}
          </div>
        </div>
      </div>
      <div style="flex-basis:200px" class="containerH" show={modeComponentNetwork}>
        <div style="flex-grow:1">
          <label>nom du composant</label>
          <input type="text" name="nameComponentInput" value={itemCurrent.name}></input>
        </div>
      </div>
    </div>


  </div>


  <script>
  this.modeNavigation=true;
  this.modeEdition=false;
  this.modeComponentNetwork=false;
  this.modeComponentTest=false;
  this.editorTitle=""
  this.persistInProgress=false;
  this.itemCurrent;//TODO create a specific component for item with connections

  this.cleanNavigation = function(){
    if(this.contentNavigator.ismounted){
      this.contentNavigator.unmount(true);
    }
    /*if(this.editionContainer.isMounted){
      this.editionContainer.unmount(true);
    }*/
    if(this.detailContainer.isMounted){
      this.detailContainer.unmount(true);
    }
  }.bind(this);

  saveEditionContainerClick(e){
    if(this.editionContainer.persist==undefined){
      var data=this.editionContainer.data;
      console.log('saveEditionContainerClick : ', data );
      for (var property in data){
        RiotControl.trigger('item_current_updateField',{field:property,data:data[property]});
      }
      console.log('saveEditionContainerClick | ',this);
      RiotControl.trigger('item_current_updateField',{field:'name',data:this.itemCurrent.name});
      RiotControl.trigger('item_current_persist');
    }else{
      this.editionContainer.persist();
    }
  }

  nagivationClick(e){
    RiotControl.trigger('item_current_cancel');
    this.mountWorkspaceNavigator(false);
  }

  closeTest(e){
    this.modeComponentTest=false;
    this.update();
  }
  testPullClick(e){
    if(this.editionContainer.testPullClick==undefined){
      var data=this.editionContainer.data;
      //console.log('saveEditionContainerClick : ', data );
      RiotControl.trigger('item_current_testPull');
    }else{
      this.editionContainer.testPullClick();

    }
  }

  connectBeforeClick(e){
    RiotControl.trigger('item_current_connect_before');
  }

  navigateWorkspaceComponentClick(e){

      RiotControl.trigger('item_current_editById',e.item._id.$oid);

  }
  connectAfterClick(e){
    RiotControl.trigger('item_current_connect_after');
  }

  this.selectTechnicalComponentMode=function(){
    //console.log('selectTechnicalComponentMode');
    //this.cleanNavigation();
    this.contentNavigator =riot.mount("#contentNavigator", 'technical-component-table')[0];
  }.bind(this);

  this.mountEdition=function(componentName){
    console.log('mountEdition | ',componentName);
    this.editionContainer =riot.mount('#editionContainer', componentName)[0];
    /*if(this.detailContainer.isMounted){
      this.detailContainer.unmount(true);
    }*/


/*    this.editionContainer.on('addComponent',function(message){
        //console.log('addComponent');
        //this.modeNavigation=true;
        RiotControl.trigger('navigation_mode_edition_and_navigation');
        this.selectTechnicalComponentMode();
        //this.update();
    }.bind(this));*/
    //console.log(this.editionContainer.title);
    this.editorTitle = this.editionContainer.title;

    RiotControl.trigger('navigation_mode_edition_only');
    //this.modeEdition=true;
    //this.modeNavigation=false;
  };

  this.mountWorkspaceNavigator=function(syncFromServer){
    this.cleanNavigation();
    this.contentNavigator =riot.mount('#contentNavigator', 'workspace-table')[0];
    this.contentNavigator.on('newWorkspace',function(message){
      this.mountEdition('workspace-editor');
      this.modeComponentNetwork=false;
      this.update();
    }.bind(this));
    this.contentNavigator.on('selectWorkspace',function(message){
      if(!this.detailContainer.isMounted){
        this.detailContainer =riot.mount("#detailContainer", 'workspace-editor')[0];
      }
    }.bind(this));
  }.bind(this);


  this.on('mount', function () {

    RiotControl.on('item_current_testPull_done',function(data){
      this.modeComponentTest=true;
      //console.log('item_current_testPull_done | data :',data);
      this.tags.testPreviewer.data=data;
      this.update();
    }.bind(this));

    RiotControl.on('navigator_mount',function(webComponentName){
      console.log('navigator_mount');
      this.cleanNavigation();
      this.contentNavigator =riot.mount('#contentNavigator', webComponentName)[0];
    }.bind(this));

    RiotControl.on('item_current_edit_mode',function(itemType,item){
      console.log('item_current_edit_mode');
      var tagName;
      switch (itemType) {
        case 'workspace':
          tagName='workspace-editor'
          //this.modeComponentNetwork=false;
          break;
        case 'generic':
          //console.log('item_current_edit_mode generic :',item);
          if(item.editor!=undefined){
            tagName=item.editor;
          }else{
            tagName='no-editor';
          }
          //this.modeComponentNetwork=true;
          break;
        default:
          tagName='no-editor'
          //this.modeComponentNetwork=false;
          break;
      }
      //console.log('item_current_edit_mode | modeComponentNetwork :',this.modeComponentNetwork);
      this.mountEdition(tagName);
      this.update();
    }.bind(this));

    RiotControl.on('item_current_changed',function(item){
      this.itemCurrent=item;
      this.update();
    }.bind(this));

    RiotControl.on('workspace_current_changed',function(item){
      if(!this.detailContainer.isMounted){
        this.detailContainer =riot.mount("#detailContainer", 'workspace-editor')[0];
      }
    }.bind(this));

    RiotControl.on('persist_start',function(data){
      //console.log('persist_start | ',this.saveButton)
      this.persistInProgress=true;
      this.update();
    }.bind(this));
    RiotControl.on('persist_end',function(data){
      this.persistInProgress=false;
      this.update();
    }.bind(this));

    RiotControl.on('navigation_mode_changed',function(data){
      console.log('navigation_mode_changed : ',data);
      this.modeNavigation=data.modeNavigation;
      this.modeEdition=data.modeEdition;
      this.modeComponentNetwork=data.modeComponentNetwork;
        this.modeComponentTest=data.modeComponentTest;

      //console.log(this.modeNavigation);
      this.update();
    }.bind(this));


    this.workspaceSelector.addEventListener('click',function(e){
      this.mountWorkspaceNavigator();
    }.bind(this));

    this.technicalComponentSelector.addEventListener('click',function(e){
      this.cleanNavigation();
      this.contentNavigator =riot.mount("#contentNavigator", 'technical-component-table')[0];
    }.bind(this));

    this.nameComponentInput.addEventListener('change',function(e){
      this.itemCurrent.name=e.currentTarget.value;
    }.bind(this));

  });
  </script>
  <style>
    .persistInProgress {
      color: red;
    }
  </style>
</navigation>
