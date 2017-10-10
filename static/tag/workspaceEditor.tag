<workspace-editor class="containerV" data-id={innerData._id}>
  <div class="containerH" style="flex-wrap:nowrap;flex-grow:1;">
    <div class=" containerV" style="flex-basis:80px;">
      <!--<div class="{color1}" if={componentView} id="component" onclick={goComponent}>Composant(s)</div>
      <div class="{color2}" id="user" if={userView} onclick={goUser}>Utilisateur(s)</div>
      <div class="{color3}" if={DescriptionView} id="description" onclick={goDescription}>Déscription</div>
      <div class="{color4}" if={DescriptionView} id="description" onclick={goUtilisation}>Utilisation</div>-->
      <div onclick={goComponent} class={commandButtonImage:true,menuSelected:menu=='component'}>
        <img src="./image/Flow-Chart-256.png" height="60px">
      </div>
      <div onclick={goUser} class={commandButtonImage:true,menuSelected:menu=='user'}>
        <img src="./image/Sharepoint-256.png" height="60px">
      </div>
      <div onclick={goInformation} class={commandButtonImage:true,menuSelected:menu=='information'}>
        <img src="./image/doc.png" height="60px">
      </div>
      <div onclick={goUtilisation} class={commandButtonImage:true,menuSelected:menu=='utilisation'}>
        <img src="./image/Pie-Chart-Graph-32.png" height="60px">
      </div>
    </div>
    <div class=" containerV" style="flex-grow:1;">
      <div class="commandBar containerH">
        <div>{innerData.name}</div>
        <div class="containerH commandGroup">
          <div onclick={editClick} class="commandButton" id="edit" if={innerData.mode=="read" }>
            edit
          </div>
          <div onclick={graphClick} class="commandButton" id="graph">
            full size
          </div>
          <!--<div onclick={cancelClick}  class="commandButton" id="cancel"  if={innerData.mode=="edit" || innerData.mode=="init"}>
                  cancel
                </div>-->
          <div onclick={persistClick} class="{commandButton:true,notSynchronized:innerData.synchronized==false}" id="save" if={innerData.mode=="edit" || innerData.mode=="init" }>
            save
          </div>
        </div>
      </div>

      <div show={menu=='component'}>
        <graph></graph>
        <!--<zenTable style="flex:1" css="background-color:white!important;color: #3883fa;" disallowcommand={innerData.mode=='read' }
          allowcancelcommand={false} id="composant" ref="componentZenTable">
          <yield to="header">
            <div>nom</div>
            <div>composant technique</div>
            <div>fonction</div>
          </yield>
          <yield to="row">
            <div style="width:20%">{name}</div>
            <div style="width:20%">{type}</div>
            <div style="width:60%">{description}</div>
          </yield>
        </zenTable>-->
      </div>
      <div show={menu=='user'}>
        <zenTable title="" style="flex:1" disallownavigation="true" css="background-color:white!important;color: #3883fa;" id="userliste" disallowcommand={innerData.mode=="read" } ref="userZenTable">
          <yield to="header">
            <div>email</div>
            <div>role</div>
          </yield>
          <yield to="row">
            <div style="width:70%">{email}</div>
            <div style="width:30%">{role}</div>
          </yield>
        </zenTable>
      </div>
      <div show={menu=='information'} class="description-worksapce" id="description" style="height: 95vh; width: 100%;display: flex;flex-direction: column;justify-content: center;align-items: center;">
        <h4 style="font-size:20px">Information sur votre workspace</h4>
        <div style="height: 30vh; width: 60%; background-color: rgb(250,250,250); padding: 2%;border-radius: 5px;">
          <label style="padding-top:3vh">{labelInputName}
          </label>
          <input
            id="workspaceNameInput"
            readonly={innerData.mode=="read"
            }
            class={readOnly
            :
            innerData.mode=="read"
            ,
            description-worksapce-input
            :
            innerData.mode=="edit"
            }
            type="text"
            ref="workspaceNameInput"
            placeholder="nom du workspace"
            value="{innerData.name}"
            onkeyup="{nameFieldChange}"></input>
          <label style="padding-top:3vh">{labelInputDesc}
          </label>
          <input
            readonly={innerData.mode=="read"
            }
            class={readOnly
            :
            innerData.mode=="read"
            ,
            description-worksapce-input
            :
            innerData.mode=="edit"
            }
            ref="workspaceDescriptionInput"
            id="workspaceDescriptionInput"
            type="text"
            placeholder="description du workspace"
            value="{innerData.description}"
            onkeyup="{descriptionFieldChange}"></input>
        </div>
      </div>
      <div show={menu=='utilisation'} style="padding: 5%;">
        <graph-of-use></graph-of-use>
      </div>
    </div>
  </div>

  <style>
    .description-worksapce-input {
      text-align: left;
      border: none;
      padding: 10px;
      font-size: 20px;

    }

    .description-worksapce {
      display: flex;
      flex-direction: column;
      width: 60%;
      padding: 5%;
    }

    .title-bar {
      color: #3883fa;
      flex: 2;
    }

    .containerHWorkspace {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      align-items: stretch;
      overflow-y: hidden;
    }

    .commandBar2 {
      justify-content: flex-end;
      background-color: white;
      color: #3883fa;
      justify-content: space-between;
      padding: 2px;
      overflow-y: visible;
    }

    .white-bar {
      background-color: white!important;
    }
    .white {
      width: 15%;
      text-align: center;
      border-bottom-style: solid;
      cursor: pointer;
      color: #3883fa;
      border: none;
      border-radius: 0;
    }

    .blue {
      width: 15%;
      text-align: center;
      border-bottom-style: solid;
      border-bottom: 1.4px solid #3883fa !important;
      cursor: pointer;
      color: #3883fa;
      border: none;
      border-radius: 0;
    }

    .notSynchronized {
      background-color: orange !important;
      color: white;
    }

    .menuSelected {
      background-color: #cce2ff;
    }

  </style>
  <script>
    this.labelInputName = "Nom"
    this.labelInputDesc = "Description"
    // this.componentView = true;
    // this.userView = true;
    // this.DescriptionView = true;
    // this.utilisationView = true;
    // this.color1 = "blue";
    // this.color2 = "white";
    // this.color3 = "white";
    // this.color4 = "white";
    this.innerData = {};
    //this.menu = "information"
    // this.modeUserList = false; this.modeComponentList = true; this.modeUserDescription = false; this.modeUtilisation = false;
    this.title = "Workspace"
    this.persist = function () {
      this.persistClick();
    }

    goInformation(e) {
      // this.modeUserList = false; this.modeComponentList = false; this.modeUserDescription = true; this.modeUtilisation = false; this.color2 = "white" this.color1 = "white" this.color3 = "blue"  this.color4 = "white"
      //this.menu = 'information';
      RiotControl.trigger('workspace_editor_change_menu','information')
      // this.update()
    }.bind(this)

    goUser(e) {
      //this.menu = 'user'
      RiotControl.trigger('workspace_editor_change_menu','user')
      // this.modeUserList = true;
      // this.modeComponentList = false;
      // this.modeUserDescription = false;
      // this.modeUtilisation = false;
      // this.color2 = "blue"
      // this.color1 = "white"
      // this.color3 = "white"
      // this.color4 = "white"
      //console.log(this.workspace._id.$oid) RiotControl.trigger('load_all_profil_by_workspace', {_id: this.workspace._id.$oid})
    }.bind(this)

    goComponent(e) {
      // this.modeUserList = false;
      // this.modeComponentList = true;
      // this.modeUserDescription = false;
      // this.modeUtilisation = false;
      // this.color2 = "white"
      // this.color1 = "blue"
      // this.color3 = "white"
      // this.color4 = "white"
      //this.menu = 'component'
      RiotControl.trigger('workspace_editor_change_menu','component')
    }.bind(this)

    goUtilisation(e) {
      // this.modeUserList = false;
      // this.modeComponentList = false;
      // this.modeUserDescription = false;
      // this.modeUtilisation = true;
      // this.color2 = "white"
      // this.color1 = "white"
      // this.color3 = "white"
      // this.color4 = "blue"
      //this.menu = 'utilisation'
      RiotControl.trigger('workspace_editor_change_menu','utilisation')
    }.bind(this)

    this.persistClick = function (e) {
      //console.log(this.tags.workspaceName);
      this.componentView = true;
      this.userView = true;
      this.DescriptionView = true;
      RiotControl.trigger('workspace_current_updateField', {
        field: 'name',
        data: this.innerData.name
      });
      RiotControl.trigger('workspace_current_updateField', {
        field: 'description',
        data: this.innerData.description
      });
      RiotControl.trigger('workspace_current_persist');
    }

    editClick(e) {
      //console.log('EDIT'); RiotControl.trigger('workspace_current_edit'); this.labelInputName = "Modifier le nom du workspace" this.labelInputDesc = "Modifier la déscription du workspace " console.log(this.innerData.mode)
    }

    graphClick(e) {
      //console.log('EDIT');
      RiotControl.trigger('workspace_current_graph');
    }

    cancelClick(e) {
      // this.componentView = true; this.userView = true; this.DescriptionView = true; RiotControl.trigger('workspace_current_cancel'); this.labelInputName = "Nom" this.labelInputDesc = "Description"
    }

    nameFieldChange(e) {
      RiotControl.trigger('workspace_current_updateField', {
        field: 'name',
        data: this.innerData.name
      });
    }

    descriptionFieldChange(e) {
      RiotControl.trigger('workspace_current_updateField', {
        field: 'description',
        data: this.innerData.description
      });
    }

    RiotControl.on('share_change', function (data) {
      console.log(data)
      this.refs.userZenTable.data = data.workspace.users;
      this.update();
      data = null;
    }.bind(this));

    // componentClick(e){   //console.log(e.item);   RiotControl.trigger('item_current_click',e.item); } / COMPONENT

    RiotControl.on('all_component_by_workspace_loaded', function (data) {
      // console.log("IN TRIGGER", data) //this.innerDataUser = data; this.tags.zentable[0].data = data.components; this.update();
    }.bind(this));

    RiotControl.on('workspace_current_add_component_cancel', function (data) {
      // this.componentView = true; this.userView = true; this.DescriptionView = true; this.update();
    }.bind(this));

    RiotControl.on('workspace_current_add_user_cancel', function (data) {
      // this.componentView = true; this.userView = true; this.DescriptionView = true; this.update();
    }.bind(this));

    RiotControl.on('save_auto', function () {
      console.log("save auto data ||")
      // this.componentView = true;
      // this.userView = true;
      // this.DescriptionView = true;
      RiotControl.trigger('workspace_current_updateField', {
        field: 'name',
        data: this.innerData.name
      });
      RiotControl.trigger('workspace_current_updateField', {
        field: 'description',
        data: this.innerData.description
      });
      RiotControl.trigger('workspace_current_persist');
    }.bind(this));

    RiotControl.on('workspace_editor_menu_changed', function (menu) {
      this.menu=menu;
      this.update();
    }.bind(this));


    this.workspaceCurrentChanged = function (data) {
      console.log('workspaceEditor | workspaceCurrentChanged | ', data);
      this.innerData = data;
      //this.tags.zentable[0].data = data.components;
      this.refs.userZenTable.data = data.users;
      //this.tags['graph-of-use'].data = data
      //console.log("graph tag =======>", this.tags['graph-of-use'].data)
      this.update();
    }.bind(this);

    // RiotControl.on('newScreenHistory', function (newScreenHistory) {
    //
    //   let lastScreen = newScreenHistory[newScreenHistory.length - 1].screen;   if (lastScreen != 'workspaceEditor') {     switch (lastScreen) {       case 'workspaceAddComponent':         this.componentView = true;         this.userView = false;
    //   this.DescriptionView = false;         break;       case 'workspaceAddUser':         this.componentView = false;         this.userView = true;         this.DescriptionView = false;         break;       default:
    //
    //     }   } else {     this.componentView = true;     this.userView = true;     this.DescriptionView = true;   }   this.screenHistory = newScreenHistory;   this.update(); }.bind(this));

    this.on('mount', function () {
      console.log('wokspaceEditor | Mount |', this);

      // this.tags.zentable[0].on('delRow', function (message) {   RiotControl.trigger('workspace_current_delete_component', message);   RiotControl.trigger('workspace_current_persist'); }.bind(this)); this.tags.zentable[0].on('addRow', function (message)
      // {   this.componentView = true;   this.userView = false;   this.DescriptionView = false;   this.utilisationView = false;   RiotControl.trigger('workspace_current_add_component_show', message); }.bind(this));

      this.refs.userZenTable.on('rowNavigation', function (data) {
        RiotControl.trigger('component_current_show');
        RiotControl.trigger('component_current_select', data);
        //this.trigger('selectWorkspace');
      }.bind(this));

      this.refs.userZenTable.on('addRow', function (message) {
        this.componentView = false;
        this.userView = true;
        this.DescriptionView = false;
        this.utilisationView = false;
        RiotControl.trigger('workspace_current_add_user_show', message);
      }.bind(this));

      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);

      ///HEADER PAGE
      this.refs.workspaceNameInput.addEventListener('change', function (e) {
        this.innerData.name = e.currentTarget.value;
      }.bind(this));

      this.refs.workspaceDescriptionInput.addEventListener('change', function (e) {
        this.innerData.description = e.currentTarget.value;
      }.bind(this));

      RiotControl.trigger('workspace_current_refresh');
    });

    this.on('unmount', function () {
      console.log('UNMOUNT');
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
    });
  </script>

</workspace-editor>

<!-- modifier -->
<!--
<input readonly={innerData.mode=="read"} class={readOnly : innerData.mode=="read"} name="workspaceNameInput" type="text" placeholder="nom du workspace" value="{innerData.name}"></input>
<input readonly={innerData.mode=="read"} class={readOnly : innerData.mode=="read"} name="workspaceDescriptionInput" type="text" placeholder="description du workspace" value="{innerData.description}"></input> -->
