<workspace-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">
  <workspace-left-menu
    workspace_id={innerData._id}
    mode={innerData.mode}
    menu={menu}
  ></workspace-left-menu>

  <!-- Page graph -->
  <div show={menu=='component'} class="containerH" style="flex-grow: 1;background-color:rgb(238,242,249)">
    <graph style="flex-grow:1"></graph>
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
      <label for="workspaceNameInput">Nom de votre Workflow:</label>
      <input id="workspaceNameInput" type="text" ref="workspaceNameInput" placeholder="Sans-titre" value="{innerData.name}" onkeyup="{nameFieldChange}" />

      <label for="workspaceDescriptionInput">Description de votre Workflow:</label>
      <input readonly={innerData.mode=="read"
            } ref="workspaceDescriptionInput" id="workspaceDescriptionInput" type="text" placeholder="Aucune description" value="{innerData.description}" onkeyup="{descriptionFieldChange}" />

      <label for="workspaceLimitHistoricInput">Nombre d'exécution consultable:</label>
      <input type="text" readonly={innerData.mode=="read"} ref="workspaceLimitHistoricnput" id="workspaceLimitHistoricInput" placeholder="1" value="{innerData.limitHistoric}" onkeyup="{limitHistoricFieldChange}" />

      <!-- bouton importer workflow -->
      <div class="containerH" style="margin-top: 20px;justify-content: flex-end;flex-grow:0;flex-shrink:0">
        <div onclick={importClick} class="commandButtonImage" style="margin-right:20px;">
          <img src="./image/upload.png" title="Importer un Workflow" style="" height="40px" width="40px">
          <input onchange={import} ref="import" type="file" style="display:none;"/>
        </div>
        <!-- bouton Exporter workflow -->
        <div onclick={export} class="commandButtonImage">
          <img src="./image/save.png" title="Exporter le Workflow" style="" height="35px" width="35px">
        </div>
      </div>
    </div>
    <!-- Bouton valider -->
    <div class="containerH" style="justify-content: center;flex-basis:45px;align-items: flex-start; flex-shrink:0;flex-grow:0;">
      <div onclick={persistClick} if={menu=='information'} class="commandButtonImage">
        <img src="./image/check.png" title="Valider les paramètres" height="35px" width="35px">
      </div>
      <div>
        <a ref="export-anchor">export anchor</a>
      </div>
    </div>
  </div>

  <!-- Page consommation -->
  <div show={menu=='running' } class="containerV" style="flex-grow: 1;">
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

    this.workspaceEditorMenuChanged = (menu) => {
      this.menu = menu;
      this.update();
    }

    this.workspaceCurrentChanged = (data) => {
      console.log('workspaceEditor | workspaceCurrentChanged | ', data);
      this.innerData = data;
      this.refs.userZenTable.data = data.users;
      this.tags['graph-of-use'].data = data
      this.update();
    }

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
    }
    limitHistoricFieldChange(e) {
      RiotControl.trigger('workspace_current_updateField', {
        field: 'limitHistoric',
        data: e.target.value
      });
    }

    descriptionFieldChange(e) {
      RiotControl.trigger('workspace_current_updateField', {
        field: 'description',
        data: e.target.value
      });
    }
    limitHistoricFieldChange(e) {
      RiotControl.trigger('workspace_current_updateField', {
        field: 'limitHistoric',
        data: e.target.value
      });
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

    this.on('mount', () => {
      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.on('share_change', this.shareChange);
      RiotControl.on('workspace_editor_menu_changed', this.workspaceEditorMenuChanged);
      RiotControl.trigger('workspace_current_refresh');
    });

    this.on('unmount', () => {
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.off('share_change', this.shareChange)
      RiotControl.off('workspace_editor_menu_changed', this.workspaceEditorMenuChanged);
    });
  </script>
</workspace-editor>
