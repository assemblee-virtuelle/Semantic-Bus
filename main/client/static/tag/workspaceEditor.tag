<workspace-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">
  <!-- Menu edition worklow -->
  <div class="containerV" style="flex-basis:80px; flex-shrink:0; background-color: rgb(124,195,232);">
    <!-- Bouton graphe -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/component' } class="containerSideBar commandButtonImage" style={this.backgroundActive("component")}>
      <img src="./image/menu/graph.png" title="Editer le graph" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Editer</p>
      <!--condition 1-->
      <div if={menu=='component'} class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
          <!--condition 2- if={menu=='addComponent'} -->
        </div>
      </div>
    </a>
    <!-- Bouton utilistaeur -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/user' } class="containerSideBar commandButtonImage" style={this.backgroundActive("user")}>
      <img src="./image/menu/share.png" title="Partager le Workflow" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Partager</p>
      <!--condition -->
      <div if={menu=='user' } class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton éditer -->
    <a href={'#workspace/' +innerData._id+'/information' } class="containerSideBar commandButtonImage " style={this.backgroundActive("information")}>
      <img src="./image/menu/tools.png" title="Paramétrer le Workflow" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Paramétrer</p>
      <!--condition -->
      <div if={menu=='information'} class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton consommation -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/running' } class="containerSideBar commandButtonImage" style={this.backgroundActive("running")}>
      <img src="./image/menu/chart-.png" title="Superviser la consommation" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Superviser</p>
      <!--condition -->
      <div if={menu=='running'} class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton Process -->
    <a if={innerData.mode=="edit"} href={'#workspace/' +innerData._id+'/process' } class="containerSideBar commandButtonImage" style={this.backgroundActive("process")}>
      <img src="./image/menu/inbox.png" title="Consulter les exécutions" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif; color:white;font-size:0.75em">Consulter</p>
      <!--condition -->
      <div if={menu=='process'} class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>

  </div>
  <!-- Page graph -->
  <div show={menu=='component'} class="containerH" style="flex-grow: 1;background-color:rgb(238,242,249)">
    <graph style="flex-grow:1"></graph>
    <!-- graph si vide -->
  </div>
  <!-- liste des partages -->
  <div show={menu=='user' } class="containerV" style="flex-grow: 1;">
    <div class="containerV" style="flex-grow:1;padding-top:20px">
      <zentable title="" drag={false} disallownavigation={true} id="userliste" disallowcommand={innerData.mode=="read" } ref="userZenTable">
        <yield to="header">
          <div class="containerTitle">
            <div class="tableTitleName">UTILISATEUR</div>
            <div class="tableTitleDescription">ROLE</div>
            <div class="tableEmpty"/>
          </div>
        </yield>
        <yield to="row">
          <div class="textRowMail">{email}</div>
          <div class="textRowOwner">{role}</div>
        </yield>
      </zentable>
    </div>
    <!-- Bouton ajouter un utilisateur -->
    <div class="containerH" style="padding-top:20px;justify-content:center; flex-basis: 45px;flex-shrink:0;flex-grow:0;">
      <div class="containerV" style="align-items: flex-start;">
        <img onclick={showShareClick} src="./image/ajout_composant.svg" class="commandButtonImage btnAddSize" title="Ajouter un utilisateur">
      </div>
    </div>
  </div>
  <!-- Page créer un workflow -->
  <div show={menu=='information' } class="containerV" id="description" style="justify-content: center; background-color: rgb(238,242,249); flex-grow: 1;">
    <div class="containerV box-flex" style="background-color: rgb(255,255,255);">
      <div class="containerV">
        <label class="labelFormStandard">Nom de votre Workflow</label>
        <div class="cardParameter">
          <input class="inputStandard" id="workspaceNameInput" type="text" ref="workspaceNameInput" placeholder="Sans-titre" value="{innerData.name}" onkeyup="{nameFieldChange}"></input>
        </div>
        <label class="labelFormStandard">Description de votre Workflow</label>
        <div class="cardParameter">
          <input class="inputStandard" readonly={innerData.mode=="read"} ref="workspaceDescriptionInput" id="workspaceDescriptionInput" type="text" placeholder="Aucune description" value="{innerData.description}" onkeyup="{descriptionFieldChange}"></input>
        </div>
        <label class="labelFormStandard">Nombre d'exécution consultable</label>
        <div class="cardParameter">
          <input defaultValue={1} class="inputStandard" type="number" readonly={innerData.mode=="read"} ref="workspaceLimitHistoricnput" id="workspaceLimitHistoricInput" placeholder="1" value="{innerData.limitHistoric}" onkeyup="{limitHistoricFieldChange}"></input>
        </div>
        <label if={innerData._id}  class="labelFormStandard">Importer un graphique (JSON)</label>
        <div if={innerData._id} class="cardParameter">
          <div onclick={importClick} class="btnFil commandButtonImage">
            Importer
            <img class="imgFil" src="./image/upload.png" title="Importer un Workflow">
            <input onchange={import} ref="import" type="file" style="display:none;"/>
          </div>
        </div>
        <label if={innerData._id}  class="labelFormStandard">Exporter au format JSON</label>
        <div if={innerData._id}  class="cardParameter">
          <div onclick={export} class="btnFil commandButtonImage">
            Exporter
            <img class="imgFil" src="./image/save.png" title="Exporter le Workflow">
            <a ref="export-anchor" style="display:none;"></a>
          </div>
        </div>
      </div> 
      <!-- bouton importer workflow -->


    </div>
    <!-- Bouton valider -->
    <div class="containerH" style="justify-content: center;flex-basis:45px;align-items: flex-start; flex-shrink:0;flex-grow:0;">
      <img onclick={persistClick} if={menu=='information'} class="commandButtonImage btnAddSize" src="./image/check.png" title="Valider les paramètres">
    </div>
  </div>
  <!-- Page consommation -->
  <div if={menu=='running' } class="containerV" style="flex-grow: 1;">
    <graph-of-use></graph-of-use>
  </div>
  <!-- Page ajouter un composant -->
  <div show={menu=='addComponent' } class="containerV" style="flex-grow: 1;">
    <technical-component-table></technical-component-table>
  </div>
  <!-- Page utilisateurs -->
  <div show={menu=='share' } class="containerV" style="flex-grow: 1;">
    <user-list></user-list>
  </div>
  <!-- Page processs -->
  <div show={menu=='process' } class="containerV" style="flex-grow: 1;">
    <process-list></process-list>
  </div>
  <!-- Edition component -->
  <div if={menu=='edit-component' } class="containerV" style="flex-grow: 1;">
    <workspace-component-editor ></workspace-component-editor>
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

    this.backgroundActive = function ( active) {
      if(active == this.menu ) {
        return {"background-color": "rgb(104,175,212)"}
      }
        return {"background-color": "rgb(124,195,232)"}
    }
    
    this.workspaceCurrentChanged = function (data) {
      this.innerData = data;
      this.refs.userZenTable.data = data.users;
      //this.tags['graph-of-use'].data = data
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

    export(e) {
      RiotControl.trigger('workspace_current_export',this.refs["export-anchor"]);
    }

    importClick(e) {
      this.refs.import.click();
    }

    import (e) {
      let file = e.target.files[0];
      RiotControl.trigger('workspace_current_import', file);
    }

    showShareClick(e) {
      route('workspace/' + this.innerData._id + '/share');
    }
    
    updateShareUser(data){
      RiotControl.trigger('delete-share-workspace',data);

    }

    this.on('mount', function () {
      //user delete
      this.tags.zentable.on('delRow',this.updateShareUser);
      RiotControl.on('store_persisteWorkspace', this.persistClick)
      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.on('share_change', this.shareChange);
      RiotControl.on('workspace_editor_menu_changed', this.workspaceEditorMenuChanged);
      RiotControl.trigger('workspace_current_refresh');
    });

    this.on('unmount', function () {
      RiotControl.off('store_persisteWorkspace', this.persistClick)
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.off('share_change', this.shareChange)
      RiotControl.off('workspace_editor_menu_changed', this.workspaceEditorMenuChanged);
    });
  </script>
  <style>
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    } 

    #description input {
      box-sizing: border-box;
      font-size: 1em;
      font-family: 'Open Sans', sans-serif;
      width: 80%;
      color: rgb(100,100,100)
    }
    .containerSideBar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      position:relative;
      flex-basis: 14vh;
    }
    .btnFil {
      justify-content: space-evenly;
      display: flex;
      flex-direction: row;
      align-items: center;
      border: solid;
      border-width: 1px;
      border-radius: 2px;
      width: 15vw;
      height: 5vh;
      color: rgb(26,145,194);
    }
    .imgFil {
      width: 3vh;
      height: 3vh
    }
    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26, 145, 194);
    }
    .tableTitleName {
      font-size: 0.85em;
      flex:0.425;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableTitleDescription {
      font-size: 0.85em;
      flex:0.425;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableEmpty {
      flex:0.15;
    }
    .textRowMail {
      font-size: 0.85em;
      flex:0.5;
      padding: 10px;
    }
    .textRowOwner {
      font-size: 0.85em;
      flex:0.5;
      padding: 10px;
    }
  </style>
</workspace-editor>
