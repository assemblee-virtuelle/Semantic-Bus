<workspace-component-editor class="containerV">
  <div class="containerH commandBar" style="flex-basis:50px">
    <div class="commandGroup" class="containerH"></div>
    <div class="commandTitle">
      {editorTitle}
    </div>
    <div class="commandGroup containerH">
      <!--<div onclick={nagivationClick} class="commandButton">
        back to navigation
      </div>-->
      <!--<div onclick={testPullClick} class="commandButton">
        tester un flux tiré
      </div>-->
      <div onclick={workClick} class="commandButton">
        run this component
      </div>
      <div onclick={saveWorkspaceComponent} class={commandButton: true, persistInProgress: persistInProgress } id="saveButton">
        save
      </div>
    </div>
  </div>
  <div style="flex-basis:100px" class="containerH">
    <div style="flex-grow:1">
      <label>nom du composant</label>
      <input type="text" id="nameComponentInput" onchange={onNameChange} value={itemCurrent.name}></input>
    </div>
  </div>
  <div style="flex-grow:1;flex-wrap: nowrap" class="containerH">

    <div style="flex-basis:250px" class="containerV">

      <div class="containerH commandBar" style="flex-basis:50px">
        <div>
          Before
        </div>
        <div class="commandGroup containerH">
          <div onclick={connectBeforeClick} class="commandButtonImage" if={!modeConnectBefore}><img src="./image/Super-Mono-png/PNG/basic/blue/toggle-expand-alt.png" height="40px"></div>
          <div onclick={cancelConnectBeforeClick} class="commandButtonImage" if={modeConnectBefore}><img src="./image/Super-Mono-png/PNG/basic/yellow/button-cross.png" height="40px"></div>
        </div>
      </div>

      <div each={itemCurrent.connectionsBefore} class="containerH" style="flex-wrap: nowrap;justify-content: space-between;align-items:flex-start;">
        <div onclick={ComponentClickToNavigate} class="selector" style="flex-grow:1;">
          {type} : {name}
        </div>
        <div onclick={deleteConnectionBefore} class="commandButtonImage" style="align-self:flex-start;flex-basis:25px;" ><img src="./image/Super-Mono-png/PNG/basic/red/button-cross.png" height="20px"></div>
      </div>

      <div onclick={componentClickToConnectBefore} class="selector" each={beforeConnectionsAvaible} style="background-color:green" if={modeConnectBefore}>
        {type} : {name}
      </div>
    </div>
    <div id="editionContainer" style="flex-grow:1" class="containerV">
      <!--<workspace-editor if={modeWorkspaceEdition}></workspace-editor>-->

    </div>
    <div show={modeComponentTest} style="flex-grow:2;flex-wrap: nowrap;" class="containerH">
      <!--<jsonPreviewer name="testPreviewer" style="flex-grow:1">
    </jsonPreviewer>-->
      <div class="containerV commandBar" style="flex-basis:50px">
        <div></div>
        <div class="commandGroup containerH">
          <div onclick={closeTest} class="commandButton">
            >
          </div>
        </div>
        <div></div>
      </div>

      <jsonEditor name="testPreviewer" ref="testPreviewer" mode="text" style="flex-grow:1"></jsonEditor>

    </div>
    <div style="flex-basis:250px" class="containerV" >
      <div class="containerH commandBar" style="flex-basis:50px">
        <div>
          After
        </div>
        <div class="commandGroup containerH">
          <div onclick={connectAfterClick} class="commandButtonImage" if={!modeConnectAfter}><img src="./image/Super-Mono-png/PNG/basic/blue/toggle-expand-alt.png" height="40px"></div>

          <div onclick={cancelConnectBeforeClick} class="commandButtonImage" if={modeConnectAfter}><img src="./image/Super-Mono-png/PNG/basic/yellow/button-cross.png" height="40px"></div>

        </div>
      </div>
      <div each={itemCurrent.connectionsAfter} class="containerH" style="flex-wrap: nowrap;justify-content: space-between;">
        <div onclick={ComponentClickToNavigate} class="selector"  style="flex-grow:1;">
          {type} : {name}
        </div>
        <div onclick={deleteConnectionAfter} class="commandButtonImage"  style="align-self:flex-start;flex-basis:25px;"><img src="./image/Super-Mono-png/PNG/basic/red/button-cross.png" height="20px"></div>
      </div>
      <!-- </div>
    <div style="flex-basis:200px" class="containerV" if={modeConnectAfter}>
       -->
      <div onclick={componentClickToConnectAfter} class="selector" each={afterConnectionsAvaible} style="background-color:green" if={modeConnectAfter}>
        {type} : {name}
      </div>
    </div>
  </div>
  <script>
    this.itemCurrent={};

    saveWorkspaceComponent(e) {
      if (this.editionContainer.persist == undefined) {
        var data = this.editionContainer.data;
        for (var property in data) {
          RiotControl.trigger('item_current_updateField', {
            field: property,
            data: data[property]
          });
        }
        RiotControl.trigger('item_current_updateField', {
          field: 'name',
          data: this.itemCurrent.name
        });
        RiotControl.trigger('item_current_persist');
      } else {
        this.editionContainer.persist();
      }
    }

    nagivationClick(e) {
      RiotControl.trigger('item_current_cancel');
      //this.mountWorkspaceNavigator(false);
    }

    closeTest(e) {
      this.modeComponentTest = false;
      this.update();
    }
    // testPullClick(e) {   if (this.editionContainer.testPullClick == undefined) {     var data = this.editionContainer.data;     //console.log('saveEditionContainerClick : ', data );     RiotControl.trigger('item_current_testPull');
    //
    //   } else {     this.editionContainer.testPullClick();
    //
    //   } }

    workClick(e) {
      //console.log('ALLO');
      if (this.editionContainer.workClick == undefined) {
        var data = this.editionContainer.data;
        //console.log('saveEditionContainerClick : ', data );
        RiotControl.trigger('item_current_work');

      } else {
        this.editionContainer.workClick();

      }
    }

    connectBeforeClick(e) {
      RiotControl.trigger('item_current_connect_before_show');
    }
    cancelConnectBeforeClick(e) {
      //console.log('cancelConnectBeforeClick');
      RiotControl.trigger('item_current_connect_cancel_show');
    }
    connectAfterClick(e) {
      RiotControl.trigger('item_current_connect_after_show');
    }

    cancelConnectAfterClick(e) {
      RiotControl.trigger('item_current_connect_cancel_show');
    }
    componentClickToConnectBefore(e) {
      console.log("componentClick", e.item);
      //RiotControl.trigger('item_current_connect_before', e.item);
      RiotControl.trigger('connect_components', e.item,this.itemCurrent);
    }
    componentClickToConnectAfter(e) {
      console.log("componentClick", e.item);
      //console.log("componentClick",e.item);
      //RiotControl.trigger('item_current_connect_after', e.item);
        RiotControl.trigger('connect_components',this.itemCurrent,e.item);
    }

    ComponentClickToNavigate(e) {
      console.log('ComponentClickToNavigate', e.item);
      //RiotControl.trigger('item_current_editById', e.item._id);
      RiotControl.trigger('component_current_select', e.item);
    }

    deleteConnectionAfter(e) {
      //console.log('ComponentClickToNavigate', e.item);
      //RiotControl.trigger('item_current_editById', e.item._id);
      RiotControl.trigger('disconnect_components', this.itemCurrent,e.item);
    }

    deleteConnectionBefore(e) {
      //console.log('ComponentClickToNavigate', e.item);
      //RiotControl.trigger('item_current_editById', e.item._id);
        RiotControl.trigger('disconnect_components',e.item,this.itemCurrent);
    }

    onNameChange(e) {
      this.itemCurrent.name = e.currentTarget.value;
    }

    this.mountEdition = function (editor) {
      //console.log('mountEdition', this);
      this.editionContainer = riot.mount('#editionContainer', editor)[0];
      //this.editionContainer.data=item; console.log('mountEdition | ', componentName, this.editionContainer); this.editorTitle = this.editionContainer.title;
    };

    // RiotControl.on('item_current_testPull_done', function (data) {   this.modeComponentTest = true;   console.log('item_current_testPull_done | data :', data);   this.tags.testPreviewer.data = data;   this.update(); }.bind(this));

    RiotControl.on('item_current_work_done', function (data) {
      this.modeComponentTest = true;
      console.log('item_current_work_done | data :', data);
      this.refs.testPreviewer.data = data;
      this.update();
    }.bind(this));

    // RiotControl.on('navigator_mount', function (webComponentName) {   console.log('navigator_mount');   this.cleanNavigation();   this.contentNavigator = riot.mount('#contentNavigator', webComponentName)[0]; }.bind(this));
    // RiotControl.on('item_current_edit_mode', function (item) {   console.log('item_current_edit_mode', item);   var tagName;
    //
    //   if (item.editor != undefined) {     tagName = item.editor;   } else {     tagName = 'no-editor';   }   //this.modeComponentNetwork=true;
    //
    //   this.mountEdition(tagName);   this.update(); }.bind(this));

    RiotControl.on('item_curent_connect_show_changed', function (modes) {
      console.log('item_curent_connect_show_changed', modes);
      this.modeConnectAfter = modes.after;
      this.modeConnectBefore = modes.before;
      this.update();
    }.bind(this));
    RiotControl.on('item_curent_available_connections', function (connections) {
      console.log('item_curent_available_connections', connections);
      this.beforeConnectionsAvaible = connections.before;
      this.afterConnectionsAvaible = connections.after;
      this.update();
    }.bind(this));

    RiotControl.on('item_current_editor_changed', function (editor) {
      console.log('item_current_editor_changed', editor)
      this.mountEdition(editor);
      this.update();
    }.bind(this));

    RiotControl.on('item_current_changed', function (item) {
      console.log('item_current_changed', item)
      this.itemCurrent = item;
      this.update();
    }.bind(this));

    this.on('mount', function () {
      RiotControl.trigger('component_current_refresh');
    });
  </script>
</workspace-component-editor>
