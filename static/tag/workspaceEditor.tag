<workspace-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">
  <!-- Menu edition worklow -->
  <div class="containerV" style="flex-basis:80px; flex-shrink:0; background-color: rgb(124,195,232);">
    <!-- Bouton graphe -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/component' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/graph.png" style="" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Editer</p>
      <!--condition 1-->
      <div if={menu=='component'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
          <!--condition 2-  if={menu=='addComponent'} -->
        </div>
      </div>
    </a>
    <!-- Bouton utilistaeur -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/user' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/share.png" style="" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Partager</p>
      <!--condition -->
      <div if={menu=='user' } class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton éditer -->
    <a href={'#workspace/' +innerData._id+'/information' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/tools.png" style="" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Paramètrer</p>
      <!--condition -->
      <div if={menu=='information'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton consommation -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/running' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/chart-.png" style="" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Superviser</p>
      <!--condition -->
      <div if={menu=='running'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton Process -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/process' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/inbox.png" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif; color:white;font-size:10px">Exécuter</p>
      <!--condition -->
      <div if={menu=='process'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
  </div>
    <!-- Page graph -->
  <div show={menu=='component'} class="containerH" style="flex-grow: 1;background-color:rgb(238,242,249)">
    <graph></graph>
    <!-- graph si vide -->

  </div>
  <!-- liste des partages -->
  <div show={menu=='user' } class="containerV" style="flex-grow: 1;background-color:rgb(238,242,249);">
    <zentable title="" drag={false} disallownavigation={true} id="userliste" disallowcommand={innerData.mode=="read" } ref="userZenTable">
      <yield to="header">
        <div style="margin-left: 50px;width:60%">Utilisateur</div>
        <div style="width:40%">role</div>
      </yield>
      <yield to="row">
        <div style="width:70%">{email}</div>
        <div style="width:30%">{role}</div>
      </yield>
    </zentable>
    <!-- Bouton ajouter un utilisateur -->
    <div class="containerU" style="justify-content:center; height:85px;">
      <div onclick={showShareClick} class="commandButtonImage containerV">
        <img src="./image/ajout_composant.svg" style="" height="40px" width="40px">
        <div style="font-family: 'Open Sans', sans-serif">Utilisateur</div>
      </div>
    </div>
  </div>

  <!-- Page créer un workflow -->

  <div show={menu=='information' } class="containerH" id="description" style="background-color: rgb(238,242,249);flex-grow: 1; width: 600px;justify-content: center;align-items: center;">
    <div class="containerV box">
      <div class="containerV" style="padding-bottom:40px;">

        <label class="label-form">Nom de votre Workflow</label>
        <input class="field" id="workspaceNameInput" type="text" ref="workspaceNameInput" placeholder="Workflow sans titre" value="{innerData.name}" onkeyup="{nameFieldChange}"></input>

        <label class="label-form" style="padding-top:3vh">Description de votre Workflow</label>
        <input class="field" readonly={innerData.mode=="read"
            } ref="workspaceDescriptionInput" id="workspaceDescriptionInput" type="text" placeholder="Aucune description" value="{innerData.description}" onkeyup="{descriptionFieldChange}"></input>

        <label class="label-form" style="padding-top:3vh">Nombre d'exécution consultable</label>
        <input class="field" type="number" readonly={innerData.mode=="read"} ref="workspaceLimitHistoricnput" id="workspaceLimitHistoricInput" type="text" placeholder="0" value="{innerData.limitHistoric}" onkeyup="{limitHistoricFieldChange}"></input>
      </div>
      <!-- bouton valider nouveau workflow -->
      <div class="containerU" style="justify-content: center; align-items: center;">
        <button class="btn" onclick={persistClick} type="button" if={menu=='information'}>Valider</button>

      </div>
    </div>
  </div>


<!-- Page consommation -->
<div show={menu=='running' } class="containerU" style="width: 300px;flex-grow: 1;background-color: rgb(238,242,249)">
  <graph-of-use></graph-of-use>
</div>
<!-- Page ajouter un composant -->
<div show={menu=='addComponent' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
  <technical-component-table></technical-component-table>
</div>
<!-- Page utilisateurs -->
<div show={menu=='share' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
  <user-list></user-list>
</div>
<!-- Page processs -->
<div show={menu=='process' } class="containerV" style="padding: 5%;flex-grow: 1;background-color: rgb(238,242,249)">
  <process-list></process-list>
</div>



<script>
this.innerData = {};
this.title = "Workspace"
/* Valider le nouveau workflow */
persistClick = function (e) {
RiotControl.trigger('workspace_current_persist')
}
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

//script bouton ajouter un utilisateur
showShareClick(e) {
route('workspace/' + this.innerData._id + '/share');
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
</workspace-editor>
