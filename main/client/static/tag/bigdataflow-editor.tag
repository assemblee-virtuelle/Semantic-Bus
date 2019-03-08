<bigdataflow-editor class="containerH" data-id={innerData._id} style="flex-wrap:nowrap;flex-grow:1">
  <!-- Menu edition worklow -->
  <div class="containerV" style="flex-basis:80px; flex-shrink:0; background-color: rgb(124,195,232);">
    <!-- Bouton graphe -->
    <a if={innerData.mode=="edit" } href={'#bigdataflow/' +innerData._id+'/main' } class="containerSideBar commandButtonImage" style={this.backgroundActive("main")}>
      <img src="./image/menu/graph.png" title="Editer le bigdataflow" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Editer</p>
      <div if={menu=='main'} class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>

    <!-- Bouton utilistaeur -->
    <a if={innerData.mode=="edit" } href={'#bigdataflow/' +innerData._id+'/user' } class="containerSideBar commandButtonImage" style={this.backgroundActive("user")}>
      <img src="./image/menu/share.png" title="Partager le bigdataflow" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Partager</p>
      <div if={menu=='user' } class="" style="position:absolute;right:0;">
        <div class="containerH" style="justify-content:flex-end;">
          <div class="arrow-left"></div>
        </div>
      </div>
    </a>

    <!-- Bouton éditer -->
    <a href={'#bigdataflow/' +innerData._id+'/information' } class="containerSideBar commandButtonImage " style={this.backgroundActive("information")}>
      <img src="./image/menu/tools.png" title="Paramétrer le bigdataflow" height="40px" width="40px">
      <p style="font-family: 'Open Sans', sans-serif;color:white;font-size:0.75em">Paramétrer</p>
      <!--condition -->
      <div if={menu=='information'} class="" style="position:absolute;right:0;">
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
  <div if={menu=='main'} class="containerH" style="flex-grow: 1;background-color:rgb(238,242,249)">
    <h1>Edition</h1>
    <!-- graph si vide -->
  </div>
  <!-- liste des partages -->
  <div if={menu=='user' } class="containerV" style="flex-grow: 1;">
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
  <!-- Page créer un bigdataflow -->
  <div if={menu=='information'} class="containerV" id="description" style="justify-content: center; background-color: rgb(238,242,249); flex-grow: 1;">
    <div class="containerV box-flex" style="background-color: rgb(255,255,255);">
      <div class="containerV">
        <label class="labelFormStandard">Nom de votre BigDataFlow</label>
        <div class="cardParameter">
          <input class="inputStandard" id="workspaceNameInput" maxlength="50" type="text" ref="workspaceNameInput" placeholder="Sans-titre" value="{innerData.name}" onkeyup="{nameFieldChange}"></input>
        </div>
        <label class="labelFormStandard">Description de votre BigDataFlow</label>
        <div class="cardParameter">
          <input class="inputStandard" readonly={innerData.mode=="read"} ref="workspaceDescriptionInput" id="workspaceDescriptionInput" type="text" placeholder="Aucune description" value="{innerData.description}" onkeyup="{descriptionFieldChange}"></input>
        </div>
      </div>
    </div>
    <!-- Bouton valider -->
    <div class="containerH" style="justify-content: center;flex-basis:45px;align-items: flex-start; flex-shrink:0;flex-grow:0;">
      <img onclick={persistClick} if={menu=='information'} class="commandButtonImage btnAddSize" src="./image/check.png" title="Valider les paramètres">
    </div>
  </div>
  <!-- Page utilisateurs -->
  <div if={menu=='share'} class="containerV" style="flex-grow: 1;">
    <h1> liste user </h1>
  </div>
  <!-- Page processs -->
  <div if={menu=='process'} class="containerV" style="flex-grow: 1;">
    <h1> liste executions </h1>
  </div>
  <!-- Edition component -->
  <div if={menu=='edit-component' } class="containerV" style="flex-grow: 1;">
    <h1>editor</h1>
  </div>

  <script>
    this.innerData = {};
    this.title = "BigDataFlow"
    /* Valider le nouveau workflow */
    persistClick = function (e) {
      RiotControl.trigger('bigdataflow-current-persist')
    }

    this.editorMenuChanged = function (menu) {
      this.menu = menu;
      this.update();
    }.bind(this);

    this.backgroundActive = function ( active) {
      if(active == this.menu ) {
        return {"background-color": "rgb(104,175,212)"}
      }
        return {"background-color": "rgb(124,195,232)"}
    }

    this.currentChanged = function (data) {
      this.innerData = data;
      if(this.menu=='user'){
        this.refs.userZenTable.data = data.users;
      //this.tags['graph-of-use'].data = data
      }
      this.update();
    }.bind(this);

    nameFieldChange(e) {
      RiotControl.trigger('bigdataflow-current-updateField', {
        field: 'name',
        data: e.target.value
      });
    }

    descriptionFieldChange(e) {
      RiotControl.trigger('bigdataflow-current-updateField', {
        field: 'description',
        data: e.target.value
      });
      this.innerData.description = e.target.value;
    }

    showShareClick(e) {
      // route('workspace/' + this.innerData._id + '/share');
    }

    updateShareUser(data){
      // RiotControl.trigger('delete-share-workspace',data);

    }

    this.on('mount', function () {
      //user delete
      if(this.menu=='user'){
        this.tags.zentable.on('delRow',this.updateShareUser);
      }
      RiotControl.on('bigdataflow-current-changed', this.currentChanged);
      RiotControl.on('bigdataflow-share-change', this.shareChange);
      RiotControl.on('bigdataflow-editor-menu-changed', this.editorMenuChanged);
      RiotControl.trigger('bigdataflow-current-refresh');
    });

    this.on('unmount', function () {
      RiotControl.off('bigdataflow-current-changed', this.currentChanged);
      RiotControl.off('share-change', this.shareChange)
      RiotControl.off('bigdataflow-editor-menu-changed', this.editorMenuChanged);
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
</bigdataflow-editor>
