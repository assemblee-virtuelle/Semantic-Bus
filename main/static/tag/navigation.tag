<navigation>
  <!-- Barre de chargement -->
  <!--  <div id="containerLoaderDiv" if={userAuthentified!=true} class="containerV" style="justify-content:center;">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText" class="containerV">
        <span>
          Sécurisation de l'application
        </span>
        <span>
          &
        </span>
        <span>
          Récupération des données personnelles
        </span>
      </h1>
    </div>
  </div>  -->
  <div id="containerLoaderDiv" if={persistInProgress} class="containerV" style="justify-content:center">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText">
        synchronisation avec le serveur
      </h1>
    </div>
  </div>
  <div id="containerErrorDiv" class="containerV" if={errorMessage}>
    <div class="containerH commandBar errorMessage"  style="pointer-events:auto;">
      <div>{errorMessage}</div>
      <div onclick={closeError} style="margin-left: 50px; cursor:pointer"><img src="./image/cross.svg" height="20px"></div>
    </div>
  </div>
  <div id="containerErrorDiv" class="containerV" if={sucessMessage} >
    <div class="containerH commandBar successMessage" style="pointer-events:auto;">
      <div>{sucessMessage}</div>
      <div onclick={closeSuccess} style="margin-left: 50px; cursor:pointer"><img src="./image/cross.svg" height="20px"></div>
    </div>
  </div>
  <!-- PAGE Principal -->
  <div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute">

    <!-- Headers -->
    <div class="background-header containerH header" style="flex-wrap:nowrap; flex-shrink : 0;">

      <!-- Logo Grappe -->
      <div class="containerV" style="flex-grow:0;flex-shrink:0;">
        <!--height:50px; width:75px;justify-content:center;height:70px; width:105px;-->
        <img src="./image/grappe-log-02.png" height="50px"style="margin-left:5px;display: flex;"></img>
      </div>
      <div style="flex-grow:0;flex-shrink:0;"></div>
      <!-- Titre headers -->
      <workspace-table-header if={isScrennToShow('myWorkspaces')}></workspace-table-header>
      <workspace-share-table-header if={isScrennToShow('sharedWorkspaces')}></workspace-share-table-header>
      <profil-header if={isScrennToShow('profil')}></profil-header>
      <workspace-editor-header if={isScrennToShow('workspace')}></workspace-editor-header>
      <workspace-component-editor-header if={isScrennToShow('component')}></workspace-component-editor-header>
      <json-previewer-header if={isScrennToShow('workPreview')}></json-previewer-header>
      <!-- Nom d'utilisateur -->
      <div style="flex-grow:0;flex-shrink:0; padding-right:10px;">
        <h3 style="color:white; font-family: 'Open Sans', sans-serif;">{CurrentName}</h3>
      </div>
      <!-- Bouton utilisateur -->
      <div class="containerV" style="flex-grow:0;flex-shrink:0;position:relative;">
        <a href="#profil//edit" class="commandButtonImage {selectedMenu:isScrennInHistory('profil')} containerV" style="flex-grow:0;">
          <div class="contentV" style="justify-content:center;width:80px;height:80px ">
            <div class="containerH" style="justify-content:center;">
              <img class="contentV" style="padding-top: 15px;width:45px;height:45px;" src="./image/menu/user.png">
            </div>
          </div>
        <!--  <div if={isScrennInHistory('profil')} class="containerH" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
            <div class="containerV" style="justify-content:flex-end;">
              <div class="arrow-up"></div>
            </div>
          </div> -->
        </a>
      </div>

    </div>
    <!-- Menu de navigation -->
    <div class="containerH" style="flex-grow:1;flex-shrink:1;">
      <div class="containerV" style="justify-content: space-between;background: linear-gradient(180deg, rgb(26,145,194) 20% ,rgb(41,181,237));flex-basis:80px;flex-shrink:0">
        <!-- Workflow -->
        <div class="containerV" style="flex-grow:1;justify-content: flex-start">
          <a href="#myWorkspaces" class="commandButtonImage {selectedMenu:isScrennInHistory('myWorkspaces')} containerV" id="workspaceSelector" style="flex-basis:100px;flex-grow:0;position:relative;">
            <img src="./image/dossier.svg" style="" width="35px">
            <div style="text-align:center;padding-top: 5px;font-family: 'Open Sans', sans-serif;color:white;font-size:10px">WorkFlow</div>
            <div if={isScrennInHistory('myWorkspaces')} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
              <div class="containerH" style="justify-content:flex-end;">
                <div class="arrow-left"></div>
              </div>
            </div>
          </a>
          <!-- Workflow Partagé -->
          <a href="#sharedWorkspaces" class="commandButtonImage {selectedMenu:isScrennInHistory('sharedWorkspaces')} containerV" style="flex-basis:100px;flex-grow:0;position:relative;">
            <img src="./image/double_dossier.svg" style="" width="35px">
            <div style="text-align:center;padding-top: 5px;font-family: 'Open Sans', sans-serif;color:white;font-size:10px">WorkFlow Partagé</div>
            <div if={isScrennInHistory('sharedWorkspaces')} class="containerV" style="position:absolute;bottom:0;top:0;right:0;left:0;justify-content:center;">
              <div class="containerH" style="justify-content:flex-end;">
                <div class="arrow-left"></div>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Contenu -->
      <div class="containerV generalContainer" style="flex-grow:1;flex-shrink:1;">
        <workspace-table if={isScrennToShow('myWorkspaces')></workspace-table>
        <workspace-share-table if={isScrennToShow('sharedWorkspaces')></workspace-share-table>
        <workspace-editor if={isScrennToShow('workspace')}></workspace-editor>
        <graph if={isScrennToShow('graph')}></graph>
        <workspace-component-editor if={isScrennToShow('component')}></workspace-component-editor>
        <profil if={isScrennToShow('profil')}></profil>
        <jsonpreviewer if={isScrennToShow('workPreview')}></jsonpreviewer>
      </div>
    </div>
  </div>

  <script>
    this.data = {};
    this.persistInProgress = false;
    this.workInProgress = false;

    closeError(e) {
      this.errorMessage = undefined;
    }

    closeSuccess(e) {
      this.sucessMessage = undefined;
    }

    this.isScrennToShow =  (screenToTest) => {
      return screenToTest == this.entity;
    }

    this.isScrennInHistory = (screenToTest) => {
      return screenToTest == this.entity;
    }

    RiotControl.on('persist_start', function (data) {
      //console.log('persist_start | ',this.saveButton)
      this.persistInProgress = true;
      this.update();
    }.bind(this));

    RiotControl.on('persist_end', function (data) {
      this.persistInProgress = false;
      this.update();
    }.bind(this));

    RiotControl.on('process-change', processCollection => {
      this.processCollection = processCollection;
      this.update();
    });

    RiotControl.on('ajax_fail', function (message) {
      this.errorMessage = message;
      this.update();
    }.bind(this));

    RiotControl.on('ajax_sucess', function (message) {
      this.sucessMessage = message;
      this.update();
    }.bind(this));

    RiotControl.on('navigation_control_done', (entity, action) => {
        this.entity = undefined;
        this.update();
        this.entity = entity;
        this.action = action;
        this.update();
    });

    this.reload_name = function(profil){
      this.CurrentName = profil? profil.name: '';
      this.update()
    }.bind(this);

    RiotControl.on('user_from_storage', this.reload_name);

    this.on('mount', function () {
      route(function (...parts) {
        const [entity, id, action] = parts
        if (id == undefined && action == undefined) {
          this.entity = entity;
          this.update();
        } else {
          RiotControl.trigger('navigation', ...parts)
        }
      }.bind(this));
      RiotControl.trigger('bootstrap')

      route.start(true);
    });
  </script>
  <style>
    .arrow-left {
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;

      border-right: 10px solid rgb(238,242,249);
    }
    .background-header {
      background-color: rgb(26,145,194);
      background-image: linear-gradient(rgb(26,145,194), rgb(26,145,194));
    }
    .AddButtonClick {
      opacity: 1;
    }

    .AddButtonNoClick {
      opacity: 0.3;
    }
    .wrapper > * {
      padding: 10px;
      flex: 1 100%;
    }

    .wrapper {
      display: flex;
      flex-flow: row wrap;
      font-weight: bold;
      text-align: center;
    }

    .generalContainer {
      background-color: rgb(238,242,249);
    }

    /*  Barre de chargement  */
    #containerSecureDiv {
      background-color: rgba(200,200,200,1);
      bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      position: absolute;
      z-index: 3;

    }

    #containerErrorDiv {
      background-color: rgba(200,200,200,0);
      bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      position: absolute;
      z-index: 2;
      pointer-events: none;
    }

    #containerLoaderDiv {
      background-color: rgba(200,200,200,0.6);
      bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      position: absolute;
      z-index: 1;
      /*width: 100%;
      height: 125vh;
      position: absolute;
      z-index: 1;
      padding: 0;
      margin: 0;
      display: -webkit-box;
      display: -moz-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      align-items: center;
      justify-content: center;*/
    }

    #row {
      display: flex;
      flex-direction: column;
      align-items: center;

    }

    #loaderText {
      padding-top: 5%;
      color: #3498db;
      font-family: Arial, Helvetica, "Liberation Sans", FreeSans, sans-serif;
      text-align: center;
    }
    #loaderDiv {
      border: 16px solid #f3f3f3;
      border-top: 16px solid #3498db;
      border-radius: 50%;
      width: 120px;
      height: 120px;
      animation: spin 2s linear infinite;
    }
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .persistInProgress {
      color: red;
    }

    .errorMessage {
      background-color: rgb(255,116,0) !important;
      color: white ! important;
      z-index: 999;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .successMessage {
          background-color: rgb(41,171,135) !important;
          color: white !important;
          z-index: 999;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
    }
    /* couleur de selection */
    .selectedMenu {
      background-color: rgb(124,195,232);
    }

    .progressContainer {
      padding: 5px;
      flex-basis: 20px;
      flex-shrink: 0;
    }
  </style>
</navigation>
