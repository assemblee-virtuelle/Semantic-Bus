<workspace-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">
  <!-- Menu edition worklow -->
  <div class="containerV" style="flex-basis:80px; flex-shrink:0; background-color: rgb(124,195,232);">
    <!-- Bouton graphe -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/component' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/graph.png" title="Editer le graph" style="" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Editer</p>
      <!--condition 1-->
      <div if={menu=='component'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
          <!--condition 2- if={menu=='addComponent'} -->
        </div>
      </div>
    </a>
    <!-- Bouton utilistaeur -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/user' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/share.png" title="Partager le Workflow" height="40px" width="40px">
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
      <img src="./image/menu/tools.png" title="Paramétrer le Workflow" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Paramétrer</p>
      <!--condition -->
      <div if={menu=='information'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton consommation -->
    <a if={innerData.mode=="edit" } href={'#workspace/' +innerData._id+'/running' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/chart-.png" title="Superviser la consommation" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:10px">Superviser</p>
      <!--condition -->
      <div if={menu=='running'} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>
    <!-- Bouton Process -->
    <a if={innerData.mode=="edit"} href={'#workspace/' +innerData._id+'/process' } class={commandButtonImage:true,containerV:true} style="flex-basis:100px;flex-grow:0;position:relative;">
      <img src="./image/menu/inbox.png" title="Consulter les exécutions" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif; color:white;font-size:10px">Consulter</p>
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
    <graph style="flex-grow:1"></graph>
    <!-- graph si vide -->
  </div>
  <!-- liste des partages -->
  <div show={menu=='user' } class="containerV" style="flex-grow: 1;">
    <div class="containerV" style="flex-grow:1;padding-top:20px">
      <zentable title="" drag={false} disallownavigation={true} id="userliste" disallowcommand={innerData.mode=="read" } ref="userZenTable">
        <yield to="header">
          <div class="table-title" style="margin-left:50px;width: 400px;flex-grow:1">Utilisateur</div>
          <div class="table-title" style="margin-right:60px;width: 300px;flex-grow:3">Rôle</div>
        </yield>
        <yield to="row">
          <div style="width: 400px;flex-grow:1">{email}</div>
          <div style="width: 300px;flex-grow:2">{role}</div>
        </yield>
      </zentable>
    </div>
    <!-- Bouton ajouter un utilisateur -->
    <div class="containerH" style="padding-top:20px;justify-content:center; flex-basis: 45px;flex-shrink:0;flex-grow:0;">
      <div class="containerV" style="align-items: flex-start;">
        <div onclick={showShareClick} class="commandButtonImage">
          <img src="./image/ajout_composant.svg" title="Ajouter un utilisateur" height="40px" width="40px">
        </div>
      </div>
    </div>
  </div>
  <!-- Page créer un workflow -->
  <div show={menu=='information' } class="containerV" id="description" style="justify-content: center;background-color: rgb(238,242,249);flex-grow: 1;">
    <div class="containerV box-flex">
      <div class="containerV">
        <label>Nom de votre Workflow:</label>
        <input id="workspaceNameInput" type="text" ref="workspaceNameInput" placeholder="Sans-titre" value="{innerData.name}" onkeyup="{nameFieldChange}"></input>
        <label>Description de votre Workflow:</label>
        <input readonly={innerData.mode=="read"} ref="workspaceDescriptionInput" id="workspaceDescriptionInput" type="text" placeholder="Aucune description" value="{innerData.description}" onkeyup="{descriptionFieldChange}"></input>
        <label>Nombre d'exécution consultable:</label>
        <input type="text" readonly={innerData.mode=="read"} ref="workspaceLimitHistoricnput" id="workspaceLimitHistoricInput" placeholder="1" value="{innerData.limitHistoric}" onkeyup="{limitHistoricFieldChange}"></input>
      </div>
      <div class="containerH" style="justify-content: center">
        <div if={innerData.mode=="edit"} class="containerH" >
          <div onclick={importClick} class="commandButtonImage" style="margin-right:20px;">
            <img src="./image/upload.png" title="Importer un Workflow" style="" height="40px" width="40px">
            <input onchange={import} ref="import" type="file" style="display:none;"/>
          </div>
          <!-- bouton Exporter workflow -->
          <div onclick={export} class="commandButtonImage">
            <img src="./image/save.png" title="Exporter le Workflow" style="" height="35px" width="35px">
            <a ref="export-anchor" style="display:none;"></a>
          </div>
        </div>
      </div>

      <!-- bouton importer workflow -->


    </div>
    <!-- Bouton valider -->
    <div class="containerH" style="justify-content: center;flex-basis:45px;align-items: flex-start; flex-shrink:0;flex-grow:0;">
      <div onclick={persistClick} if={menu=='information'} class="commandButtonImage">
        <img src="./image/check.png" title="Valider les paramètres" height="35px" width="35px">
      </div>
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

    //script bouton ajouter un utilisateur
    showShareClick(e) {
      route('workspace/' + this.innerData._id + '/share');
    }

    this.on('mount', function () {
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

    #description input {
      box-sizing: border-box;
      font-size: 1em;
      font-family: 'Open Sans', sans-serif;
      width: 80%;
      color: rgb(100,100,100)
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
