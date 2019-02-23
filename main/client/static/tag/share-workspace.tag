<share-workspace class="containerV" style="flex-grow:1;">
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
        <div class="tableRowMail">{email}</div>
        <div class="tableRowOwner">{role}</div>
      </yield>
    </zentable>
  </div>
  <!-- Bouton ajouter un utilisateur -->
  <div class="containerH" style="padding-top:20px;justify-content:center; flex-basis: 45px;flex-shrink:0;flex-grow:0;">
    <div class="containerV" style="align-items: flex-start;">
      <img onclick={showShareClick} class="commandButtonImage btnAddSize" src="./image/ajout_composant.svg" title="Ajouter un utilisateur" >
    </div>
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
  </script>
  <style> 
    .rowImg {
      height: 3vh;
      width: 3vh;
      margin-right: 1vh;
    }
    .tableRowName {
      font-size: 0.85em;
      flex: 0.3;
      padding: 10px;
      justify-content: flex-start;
      display: flex;
      align-items: center;
    }
    .tableRowDescription {
      font-size: 0.85em;
      flex:0.695;
      padding: 10px;
    }

    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleName {
      font-size: 0.85em;
      flex:0.26;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableTitleDescription {
      font-size: 0.85em;
      flex:0.595;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableEmptyImg {
      flex:0.05;
    }
    .tableEmpty {
      flex:0.15;
    }
  </style>
</share-workspace>
