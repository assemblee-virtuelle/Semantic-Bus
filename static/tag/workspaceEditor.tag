<workspace-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">

  <div class="containerV" style="flex-basis:80px; flex-shrink:0; background-color: rgb(9,245,185);">
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/component' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;">
      <img src="./image/Graphe_2.svg" style="" height="40px" width="40px">
      <p style="color:white;font-size:12px">Graphique</p>
    </a>
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/user' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;">
      <img src="./image/En_groupe.svg" style="" height="40px" width="40px">
      <p style="color:white;font-size:12px">Utilisateurs</p>
    </a>
    <a href={'#workspace/' +innerData._id+'/information' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;">
      <img src="./image/Autres.svg" style="" height="40px" width="40px">
      <p style="color:white;font-size:12px">Editer</p>
    </a>
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/running' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;">
      <img src="./image/Stats.svg" style="" height="40px" width="40px">
      <p style="color:white;font-size:12px">Conso</p>
    </a>
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/process' }  class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;">
      <img src="./image/Super-Mono-png/PNG/sticker/icons/traffic-lights.png" style="" height="40px" width="40px">
      <p style="color:white;font-size:12px">Process</p>
    </a>

  </div>
  <div show={menu=='component'} class="containerV" style="flex-grow: 1;background-color:rgb(238,242,249)">
    <graph></graph>
  </div>
  <div show={menu=='user' } class="containerV" style="flex-grow: 1;background-color:rgb(238,242,249);">
    <zenTable  title="" drag={false} disallownavigation={true} id="userliste" disallowcommand={innerData.mode=="read" } ref="userZenTable">
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
  <div show={menu=='information' } class="containerH" id="description" style="background-color: rgb(238,242,249);flex-grow: 1;justify-content: center;align-items: center;">
    <div class="containerV" style="flex-grow: 0.5;background-color: rgb(250,250,250); padding: 2%;border-radius: 5px;">
      <div class="containerV">

          <label class="label-form">Nom de votre Workspace</label>
          <input
            class="field"
            id="workspaceNameInput"
            type="text"
            ref="workspaceNameInput"
            placeholder="nom du workspace"
            value="{innerData.name}"
            onkeyup="{nameFieldChange}"></input>

          <label class="label-form" style="padding-top:3vh">Description de votre Workspace</label>
          <input
            class="field"
            readonly={innerData.mode=="read"
            }
            ref="workspaceDescriptionInput"
            id="workspaceDescriptionInput"
            type="text"
            placeholder="description du workspace"
            value="{innerData.description}"
            onkeyup="{descriptionFieldChange}">
          </input>

          <label class="label-form" style="padding-top:3vh">nombre de process consultable</label>
          <input
            class="field"
            readonly={innerData.mode=="read"
            }
            ref="workspaceLimitHistoricnput"
            id="workspaceLimitHistoricInput"
            type="text"
            placeholder="nombre de process consultable"
            value="{innerData.limitHistoric}"
            onkeyup="{limitHistoricFieldChange}">
          </input>
          <button onclick={export}>export</button>
          <button onclick={importClick}>import</button><input onchange={import} ref="import" type="file" style="display:none"/>

      </div>
    </div>
  </div>
  <div show={menu=='running' } class="containerH" style="flex-grow: 1;background-color: rgb(238,242,249)">
    <graph-of-use></graph-of-use>
  </div>
  <div show={menu=='addComponent' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
    <technical-component-table></technical-component-table>
  </div>
  <div show={menu=='share' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
    <user-list></user-list>
  </div>
  <div show={menu=='process' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
    <process-list></process-list>
  </div>
</div>
</div>
<script>
  this.innerData = {};
  this.title = "Workspace"

  this.workspaceEditorMenuChanged = function (menu) {
    this.menu = menu;
    this.update();
  }.bind(this);

  this.workspaceCurrentChanged = function (data) {
    console.log('workspaceEditor | workspaceCurrentChanged | ', data);
    this.innerData = data;
    this.refs.userZenTable.data = data.users;
    this.tags['graph-of-use'].data = data
    this.update();
  }.bind(this);

  nameFieldChange(e) {
    RiotControl.trigger('workspace_current_updateField', {
      field: 'name',
      data: e.target.value
    });
  }

  descriptionFieldChange(e) {
    RiotControl.trigger('workspace_current_updateField', {
      field: 'description',
      data: e.target.value
    });
    //this.innerData.description = e.target.value;
  }
  limitHistoricFieldChange(e) {
    RiotControl.trigger('workspace_current_updateField', {
      field: 'limitHistoric',
      data: e.target.value
    });
    //this.innerData.description = e.target.value;
  }

  export(e){
    RiotControl.trigger('workspace_current_export');
  }

  importClick(e){
    this.refs.import.click();
  }

  import(e){
    let file = e.target.files[0];
    RiotControl.trigger('workspace_current_import',file);
  }


  this.on('mount', function () {
    //console.log('wokspaceEditor | Mount |', this);
    RiotControl.on('store_persisteWorkspace', this.persistClick)
    RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);
    RiotControl.on('share_change', this.shareChange);
    RiotControl.on('workspace_editor_menu_changed', this.workspaceEditorMenuChanged);
    RiotControl.trigger('workspace_current_refresh');
  });

  this.on('unmount', function () {
    //console.log('UNMOUNT');
    RiotControl.off('store_persisteWorkspace', this.persistClick)
    RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
    RiotControl.off('share_change', this.shareChange)
    RiotControl.off('workspace_editor_menu_changed', this.workspaceEditorMenuChanged);
  });
</script>
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

  .field {
    background-color: #f4f5f7;
    border-radius: 3rem;
    padding: 10px 20px 11px;
    color: rgba(0,0,0,0.6);
  }

  .field:focus {
    background-color:rgb(33,150,243);
    color:white
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
</workspace-editor>
