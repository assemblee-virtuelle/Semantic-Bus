<workspace-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">

  <div class=" containerV" style="flex-basis:70px; background-color: rgb(9,245,185);">
    <!--<div class="{color1}" if={componentView} id="component" onclick={goComponent}>Composant(s)</div>
      <div class="{color2}" id="user" if={userView} onclick={goUser}>Utilisateur(s)</div>
      <div class="{color3}" if={DescriptionView} id="description" onclick={goDescription}>Déscription</div>
      <div class="{color4}" if={DescriptionView} id="description" onclick={goUtilisation}>Utilisation</div>-->
    <div class=" containerV" style="flex-basis:500px; background-color: rgb(9,245,185);flex-grow:0">
      <div onclick={goComponent} class={commandButtonImage:true,containerV:true} style="flex-basis:120px">
        <img src="./image/Graphe_2.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Graphique</p>
      </div>
      <div onclick={goUser} class={commandButtonImage:true,containerV:true} style="flex-basis:120px">
        <img src="./image/En_groupe.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Utilisateurs</p>
      </div>
      <div onclick={goInformation} class={commandButtonImage:true,containerV:true} style="flex-basis:120px">
        <img src="./image/Autres.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Editer</p>
      </div>
      <div onclick={goUtilisation} class={commandButtonImage:true,containerV:true} style="flex-basis:120px">
        <img src="./image/Stats.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Conso</p>
      </div>
    </div>
  </div>
  <!--  <div class=" containerV" style="flex-grow:1; background-color:rgb(238,242,249)">
      <div class="header">
        <div class="commandBar containerH">
          <div></div>
          <div>{innerData.name}</div>
            <div onclick={persistClick} class="buttonBus {notSynchronized:innerData.synchronized==false}" id="save" if={innerData.mode=="edit" || innerData.mode=="init" }>
              save
          </div>
        </div>
      </div>  -->

  <div show={menu=='component' } class="containerV" style="flex-grow: 1;background-color:rgb(238,242,249)">
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
  <div show={menu=='user' } class="containerV" style="flex-grow: 1;background-color:rgb(238,242,249);">
    <div class="containerV" style="padding: 15pt;">
      <div class="commandBar containerH" style="justify-content:flex-end">
        <image src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addUser}></image>
      </div>
      <zenTable title="" drag={false} disallownavigation={true} id="userliste" disallowcommand={innerData.mode=="read" } ref="userZenTable">
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
  </div>
  <div show={menu=='information' } class="containerH" id="description" style="background-color: rgb(238,242,249);flex-grow: 1;justify-content: center;align-items: center;">
    <div class="containerV" style="box-shadow: 0px 0px 5px rgba(134,134,134,0.5);flex-grow: 0.5;background-color: rgb(250,250,250); padding: 2%;border-radius: 5px;">
      <div class="containerV">
        <label class="label-form" style="padding-top:3vh">{labelInputName}
        </label>
        <input
          id="workspaceNameInput"
          readonly={innerData.mode=="read"
          }
          class={readOnly:innerData.mode=="read"
          ,description-worksapce-input:innerData.mode=="edit"
          }
          type="text"
          ref="workspaceNameInput"
          placeholder="nom du workspace"
          value="{innerData.name}"
          onkeyup="{nameFieldChange}"></input>
      </div>
      <div class="containerV">
        <label class="label-form" style="padding-top:3vh">{labelInputDesc}</label>
        <input
          readonly={innerData.mode=="read"
          }
          class={readOnly:
          innerData.mode=="read"
          ,description-worksapce-input:innerData.mode=="edit"
          }
          ref="workspaceDescriptionInput"
          id="workspaceDescriptionInput"
          type="text"
          placeholder="description du workspace"
          value="{innerData.description}"
          onkeyup="{descriptionFieldChange}"></input>
      </div>
    </div>
  </div>
  <div show={menu=='utilisation' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
    <graph-of-use></graph-of-use>
  </div>
</div>
</div>

<style>

.label-form {
  display: flex;
  margin-bottom: 1em;
  margin-top: 1em;
  color: rgb(120,120,120);
  align-self: center;
}
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
this.labelInputName = "Nom de votre Workspace"
this.labelInputDesc = "Description de votre Workspace"
// this.componentView = true; this.userView = true; this.DescriptionView = true; this.utilisationView = true; this.color1 = "blue"; this.color2 = "white"; this.color3 = "white"; this.color4 = "white";
this.innerData = {};
//this.menu = "information" this.modeUserList = false; this.modeComponentList = true; this.modeUserDescription = false; this.modeUtilisation = false;
this.title = "Workspace"

goInformation(e) {
  // this.modeUserList = false; this.modeComponentList = false; this.modeUserDescription = true; this.modeUtilisation = false; this.color2 = "white" this.color1 = "white" this.color3 = "blue"  this.color4 = "white" this.menu = 'information';
  RiotControl.trigger('workspace_editor_change_menu', 'information')
  // this.update()
}.bind(this)

goUser(e) {
  //this.menu = 'user'
  RiotControl.trigger('workspace_editor_change_menu', 'user')
  // this.modeUserList = true; this.modeComponentList = false; this.modeUserDescription = false; this.modeUtilisation = false; this.color2 = "blue" this.color1 = "white" this.color3 = "white" this.color4 = "white" console.log(this.workspace._id.$oid)
  // RiotControl.trigger('load_all_profil_by_workspace', {_id: this.workspace._id.$oid})
}.bind(this)

goComponent(e) {
  // this.modeUserList = false; this.modeComponentList = true; this.modeUserDescription = false; this.modeUtilisation = false; this.color2 = "white" this.color1 = "blue" this.color3 = "white" this.color4 = "white" this.menu = 'component'
  RiotControl.trigger('workspace_editor_change_menu', 'component')
}.bind(this)

goUtilisation(e) {
  // this.modeUserList = false; this.modeComponentList = false; this.modeUserDescription = false; this.modeUtilisation = true; this.color2 = "white" this.color1 = "white" this.color3 = "white" this.color4 = "blue" this.menu = 'utilisation'
  RiotControl.trigger('workspace_editor_change_menu', 'utilisation')
}.bind(this)

this.persistClick = function (e) {
  console.log("--------- persistClick WORKSPACE TAG ----------------", this.innerData)
  RiotControl.trigger('persistClick', this.innerData)
}.bind(this)

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

RiotControl.on('all_component_by_workspace_loaded', function (data) {}.bind(this));

RiotControl.on('workspace_current_add_component_cancel', function (data) {}.bind(this));

RiotControl.on('workspace_current_add_user_cancel', function (data) {}.bind(this));

RiotControl.on('workspace_editor_menu_changed', function (menu) {
  console.log("workspace_editor_menu_changed")
  this.menu = menu;
  this.update();
}.bind(this));

this.workspaceCurrentChanged = function (data) {
  console.log('workspaceEditor | workspaceCurrentChanged | ', data);
  this.innerData = data;
  this.refs.userZenTable.data = data.users;
  this.tags['graph-of-use'].data = data
  this.update();
}.bind(this);

addUser(e) {
  console.log("add user")
  this.componentView = false;
  this.userView = true;
  this.DescriptionView = false;
  this.utilisationView = false;
  RiotControl.trigger('workspace_current_add_user_show');
}

this.shareChange = function (data) {
  console.log("ALERT ALLO share_change", data)
  this.refs.userZenTable.data = data.workspace.users;
  this.update();
}.bind(this)

this.on('mount', function () {
  console.log('wokspaceEditor | Mount |', this);
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
    //RiotControl.trigger('workspace_current_add_user_show', message);
  }.bind(this));

  RiotControl.on('store_persisteWorkspace', this.persistClick)
  RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);

  ///HEADER PAGE
  this.refs.workspaceNameInput.addEventListener('change', function (e) {
    this.innerData.name = e.currentTarget.value;
  }.bind(this));

  this.refs.workspaceDescriptionInput.addEventListener('change', function (e) {
    this.innerData.description = e.currentTarget.value;
  }.bind(this));

  RiotControl.on('share_change', this.shareChange);

  RiotControl.trigger('workspace_current_refresh');
});

this.on('unmount', function () {
  console.log('UNMOUNT');
  RiotControl.off('store_persisteWorkspace', this.persistClick)
  RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
  RiotControl.off('share_change', this.shareChange)
});
</script>

</workspace-editor>
<!--
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
    }  -->
<!--
    RiotControl.on('save_auto', function () {
      console.log("save auto data ||")
      RiotControl.trigger('workspace_current_updateField', {
        field: 'name',
        data: this.innerData.name
      });
      RiotControl.trigger('workspace_current_updateField', {
        field: 'description',
        data: this.innerData.description
      });
      RiotControl.trigger('workspace_current_persist');
    }.bind(this));  -->
<!-- modifier -->
<!--
<input readonly={innerData.mode=="read"} class={readOnly : innerData.mode=="read"} name="workspaceNameInput" type="text" placeholder="nom du workspace" value="{innerData.name}"></input>
<input readonly={innerData.mode=="read"} class={readOnly : innerData.mode=="read"} name="workspaceDescriptionInput" type="text" placeholder="description du workspace" value="{innerData.description}"></input> -->
