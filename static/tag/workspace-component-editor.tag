<workspace-component-editor class="containerV" style="flex-grow:1" >
  <div style="flex-basis:100px; padding:5pt; background-color: rgb(238,242,249);" class="containerV">
    <label style="padding:5pt;text-align:center"><strong>Nom du composant</strong></label>
    <input type="text" id="nameComponentInput" onchange={onNameChange} value={itemCurrent.name}></input>
    <label style="padding:5pt;text-align:center"><strong>Parametrage du composant</strong></label>
    <div id="editionContainer" style="flex-grow:1; padding: 15pt;
    background-color: rgb(238,242,249);" class="containerH"></div>
  </div>
  <script>
    this.itemCurrent={};


    nagivationClick(e) {
      RiotControl.trigger('item_current_cancel');
      //this.mountWorkspaceNavigator(false);
    }

    closeTest(e) {
      this.modeComponentTest = false;
      this.update();
    }

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

     this.saveWorkspaceComponent = function() {
      if (this.editionContainer.persist == undefined) {
        var data = this.editionContainer.data;
        //console.log('ALLO',data);
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
    }.bind(this)

    this.on('mount', function () {
      RiotControl.trigger('component_current_refresh');
      RiotControl.on('store_component_workspace_editor', this.saveWorkspaceComponent);
    });

    this.on('unmount', function(){
      RiotControl.off('store_component_workspace_editor', this.saveWorkspaceComponent);
    })
  </script>
</workspace-component-editor>
