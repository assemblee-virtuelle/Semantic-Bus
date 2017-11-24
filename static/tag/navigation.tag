<navigation>

  <div id="containerloaderDiv">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText">
        Sécurisation de l'application en cour
      </h1>
    </div>
  </div>
  <div id="containerloaderDiv" if={persistInProgress}>
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText">
        Sauvegarde en cours
      </h1>
    </div>
  </div>
  <div class="containerH commandBar errorMessage" if={errorMessage}>
    <div>{errorMessage}</div>
    <div onclick={closeError} class="commandButtonImage"><img src="./image/Super-Mono-png/PNG/basic/red/button-cross.png" height="20px"></div>
  </div>
  <div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute">
    <!--  CONTAINER GENERAL  -->
    <!--<div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute;flex-basis:100%">-->
    <!--<div class="containerV" style="flex-basis:100%">-->
    <div class="containerH" style="background-color: rgb(33,150,243);flex-wrap:nowrap;flex-shrink : 0;">
      <router>
        <route path="hello">
          <p>HELLO 1</p>
        </route>
        <route path="hello2">
          <p>HELLO 2</p>
        </route>
      </router>
      <!--  HEADER WORKSPACE  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('myWorkspaces')}>
        <div class="header">
          <div class="containerH commandBar" style="margin-bottom: 15pt;justify-content:center">
            <div>
              <strong>Mes Work</strong>spaces</div>
          </div>
          <div class="containerH commandBar">
            <div></div>
            <div><input class="champ" type="text" name="inputSearch" ref="inputSearch" placeholder="Search" onkeyup={ filterCards }></div>
            <div onclick={addRowClick} class="buttonBus">
              Add
            </div>
          </div>
        </div>
      </div>

      <!--  HEADER LANDING  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('landing')}>
        <div class="header">
          <div class="containerH commandBar" style="justify-content:center">
            <div>
              <strong class="main-title">Bienvenue</strong>
            </div>
          </div>
        </div>
      </div>

      <!--  HEADER WORKSPACE SHARE  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('sharedWorkspaces')}>
        <div class="header">
          <div class="containerH commandBar" style="justify-content: center;flex-direction: column;align-items: center;">
            <div class="containerH commandBar" style="margin-bottom: 15pt;flex-grow: 1;justify-content:center">
              <strong>Mes Work</strong>spaces partagés
            </div>
            <input class="champ" type="text" name="inputSearch" ref="inputSearch" placeholder="Search" onkeyup={ filterCards }>
          </div>
        </div>
      </div>

      <!--  HEADER PROFIL  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('profil')}>
        <div class="header">
          <div class="containerH commandBar" style="flex-grow: 1;justify-content: center;flex-direction: column;align-items: center;">
            <div class="main-title">
              <strong>Mon espace</strong>
              personnel</div>
          </div>
        </div>
      </div>

      <!--  HEADER ADD USER WORKSPACE  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('workspace') && action=='share'}>
        <div class="header">
          <div class="containerH commandBar" style="justify-content: space-between;">
            <div class="main-title">Partager votre workspace</div>
            <image style="margin-left: -1px; color: white; cursor: pointer;" src="./image/Share.svg" class="commandButtonImage" width="40" height="40" onclick={share}></image>
          </div>
        </div>
      </div>

      <!--  HEADER ADD COMPONENT  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('workspace') && action=='addComponent'}>
        <div class="header">
          <div class="containerH commandBar" style="justify-content: space-between;align-items: center;">
            <div></div>
            <div class="main-title">
              <strong>Ajouter</strong>
              un composant
            </div>
            <image class={AddButtonClick:actionReady,AddButtonNoClick:!actionReady} style="margin-left: -1px; color: white; cursor: pointer;" src="./image/ajout_composant.svg" class="commandButtonImage" width="50" height="50" onclick={addComponent}></image>
          </div>
        </div>
      </div>

      <!--  HEADER WORKSPACE EDITOR  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('workspace') && action!='addComponent' && action!='share'}>
        <div class="header">
          <div class="commandBar containerH">
            <div></div>
            <div class="main-title">{workspaceName}</div>
            <div onclick={persistClick} class="buttonBus {notSynchronized:synchronized==false}" id="save">
              save
            </div>
          </div>
        </div>
      </div>

      <!--  HEADER WORKSPACE COMPONENT EDITOR  -->
      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('componentEditor')}>
        <div class="header">
          <div class="commandBar containerH">
            <div></div>
            <div class="main-title">Editer votre composant</div>
            <div onclick={saveWorkspaceComponent} class="buttonBus {notSynchronized:synchronized==false}" id="save">
              save
            </div>
          </div>
        </div>
      </div>

      <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('workPreview')}>
        <div class="header">
          <div class="commandBar containerH">
            <div></div>
            <div class="main-title">flux de sortie du composant</div>
            <div onclick={saveWorkspaceComponent} class="buttonBus {notSynchronized:synchronized==false}" id="save">
              save
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="containerH" style="justify-content:center;justify-content: inherit; flex-grow:1;flex-shrink : 1;">

      <!--  NAVBAR   -->
      <div class="containerV" style="justify-content: space-between;background: linear-gradient(180deg, rgb(33,150,243) 20% ,rgb(41,181,237));flex-basis:80px;flex-shrink:0">
        <!--<div class="containerV" style="flex-grow:1">-->
        <div class="containerV" style="flex-basis:400px;flex-grow:0;">
          <!--<div class={commandButtonImage:true,selectedMenu:isScrennInHistory('myWorkspaces'),containerV:true} onclick={workspaceSelectorClick} id="workspaceSelector" style="flex-basis:150px;justify-content:center;align-items:center">
            <img src="./image/dossier.svg" style="margin-bottom:10px" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px">Worksapces</p>
          </div>-->
          <a href="#myWorkspaces" class={commandButtonImage:true,selectedMenu:isScrennInHistory('myWorkspaces'),containerV:true} id="workspaceSelector" style="flex-basis:150px;justify-content:center;align-items:center">
            <img src="./image/dossier.svg" style="margin-bottom:10px" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px">Worksapces</p>
          </a>

          <a href="#sharedWorkspaces" class={commandButtonImage:true,selectedMenu:isScrennInHistory('sharedWorkspaces'),containerV:true} style="flex-basis:150px">
            <img src="./image/double_dossier.svg" style="margin-bottom:10px" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px;text-align:center">Worksapces Partagé</p>
          </a>
          <a href="#profil" class={commandButtonImage:true,selectedMenu:isScrennInHistory('profil'),containerV:true} style="flex-basis:150px">
            <img src="./image/photo.svg" style="margin-bottom:10px" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px">Profil</p>
          </a>
          <!--  ADMIN  -->
          <a href="#admin" class={commandButtonImage:true,selectedMenu:isScrennInHistory('admin'),containerV:true} if={showAdmin} style="flex-basis:150px">
            <img src="./image/Roulette_bus.svg" style="margin-bottom:10px" width="40px">
            <p style="color:white;font-size:12px">Paramêtres</p>
          </a>
        </div>
        <div class="containerV" style="flex-basis:40px;flex-grow:0;">
          <div class="commandButtonImage" style="flex-basis:120px">
            <img src="./image/working.gif" width="40px" if={workInProgress}>
          </div>
        </div>
      </div>

      <!--  CONTENT   -->

      <div class="containerV" style="flex-grow:1">
        <!--<router class="containerV">
          <route path="landing" class="containerV" if={isScrennToShow('landing')}>
            <landing></landing>
          </route>
          <route path="myWorkspaces" class="containerV">
            <workspace-table></workspace-table>
          </route>
          <route path="sharedWorkspace" class="containerV">
            <workspace-share-table></workspace-share-table>
          </route>
          <route path="workspaceEditor" class="containerV">
            <workspace-editor></workspace-editor>
          </route>
          <route path="workspaceAddComponent" class="containerV">
            <technical-component-table></technical-component-table>
          </route>
          <route path="workspaceAddUser" class="containerV">
            <user-list></user-list>
          </route>
          <route path="graph" class="containerV">
            <graph></graph>
          </route>
          <route path="componentEditor" class="containerV">
            <workspace-component-editor></workspace-component-editor>
          </route>
          <route path="profil" class="containerV">
            <profil></profil>
          </route>
          <route path="admin" class="containerV">
            <admin></admin>
          </route>
          <route path="workPreview" class="containerV">
            <jsonPreviewer></jsonPreviewer>
          </route>
        </router>-->

        <landing if={isScrennToShow('landing')}></landing>
        <workspace-table if={isScrennToShow('myWorkspaces')></workspace-table>
        <workspace-share-table if={isScrennToShow('sharedWorkspaces')></workspace-share-table>
        <workspace-editor if={isScrennToShow('workspace')}></workspace-editor>
        <!--<technical-component-table if={isScrennToShow('workspaceAddComponent')}></technical-component-table>-->
        <!--<user-list if={isScrennToShow('workspaceAddUser')} style="height:100%"></user-list>-->
        <graph if={isScrennToShow('graph')}></graph>
        <workspace-component-editor if={isScrennToShow('component')}></workspace-component-editor>
        <profil if={isScrennToShow('profil')}></profil>
        <admin if={isScrennToShow('admin')}></admin>
        <jsonPreviewer if={isScrennToShow('workPreview')}></jsonPreviewer>

      </div>
      <!--</div>-->

    </div>
  </div>
  <script>

    this.persistInProgress = false;
    this.workInProgress = false;
    this.isPrincipalMenu = true;
    this.workspaceName = ""
    this.actionReady = false;

    //HEADER EVENT

    filterCards(e) {
      RiotControl.trigger('nav_filterCards', e);
    }

    addRowClick(e) {
      RiotControl.trigger('nav_addRowWorkspace')
    }

    persistClick(e) {
      RiotControl.trigger('nav_persisteWorkspace')
    }

    addComponent(e) {
      console.log("In navigation")
      RiotControl.trigger("add_component_click")
    }

    RiotControl.on("workspace_current_select_done", function (res) {
      this.workspaceName = res.name
      this.update()
    }.bind(this))

    share(e) {
      console.log("share navigation")
      RiotControl.trigger("nav_share_workspace")
      this.update()
    }.bind(this)

    saveWorkspaceComponent(e) {
      console.log("saveWorkspaceComponent nav tag")
      RiotControl.trigger("nav_component_workspace_editor")
    }

    RiotControl.on("row_add_component_select", function () {
      console.log("row_add_component_select TEST")
      this.actionReady = true;
      this.update()
    }.bind(this))

    RiotControl.on("ajax_receipt", function () {
      console.log("in hide");
      $("#containerloaderDiv").hide();
      this.update()
    }.bind(this));

    RiotControl.on("ajax_send", function () {
      console.log("in show");
      $("#containerloaderDiv").show();
      this.update()
    }.bind(this));
    ////TEST LOGIN ////
    this.isGoodUser = function () {
      RiotControl.trigger('is_token_valid?');
    }

    //don't work if is placed in mount
    this.isGoodUser();

    profilSelectorClick(e) {
      RiotControl.trigger('profil_show');
    }
    workspaceSelectorClick(e) {
      RiotControl.trigger('workspace_show');
    }

    workspaceShareSelectorClick(e) {
      RiotControl.trigger('workspace_share_show');
    }
    technicalComponentSelectorClick(e) {
      RiotControl.trigger('technicalComponent_show');
    }
    adminSelectorClick(e) {
      RiotControl.trigger('admin_show');
    }

    showMenu(e) {
      RiotControl.trigger('menu_show');
    }

    back(e) {
      RiotControl.trigger('back');
    }

    closeError(e) {
      this.errorMessage = undefined;
    }

    this.isScrennToShow = function (screenToTest) {
      // let out=false; //console.log(this.routePath); if(this.screen!=undefined && this.screen.indexOf(screenToTest)!=-1){   out=true; }
      return screenToTest == this.entity;
      //console.log('router',this.router.hist); let out = false; if (this.screenHistory != undefined) {   out = sift({     screen: screenToTest,     show: true   }, this.screenHistory).length > 0; } return out;
    }

    this.isScrennInHistory = function (screenToTest) {
      let out = false;
      if (this.screenHistory != undefined) {
        out = sift({
          screen: screenToTest
        }, this.screenHistory).length > 0;
      }
      return out;
    }

    this.isScrennHide = function () {
      return sift({
        show: false
      }, this.screenHistory).length > 0;
    }

    RiotControl.on('newScreenHistory', function (newScreenHistory) {
      //console.log('newScreenHistory', newScreenHistory[newScreenHistory.length -1].screen);workspaceAddComponent
      this.screenHistory = newScreenHistory;
      if (newScreenHistory[newScreenHistory.length - 1].screen == "workspaceAddComponent" || newScreenHistory[newScreenHistory.length - 1].screen == "landing" || newScreenHistory[newScreenHistory.length - 1].screen == "myWorkspaces" || newScreenHistory[newScreenHistory.length - 1].screen == "sharedWorkspaces") {
        //console.log("IN IF")
        this.isPrincipalMenu = true
      } else {
        this.isPrincipalMenu = false
      }
      this.update();
    }.bind(this));

    RiotControl.on('user_authentified', function (data) {
      console.log('user_authentified', localStorage.user_id);
      RiotControl.trigger('load_profil');
    }.bind(this));

    RiotControl.on('profil_loaded', function (data) {
      console.log('profil_loaded navigation');
      this.showAdmin = data.user.admin;
      this.update();
    }.bind(this));

    RiotControl.on('persist_start', function (data) {
      //console.log('persist_start | ',this.saveButton)
      this.persistInProgress = true;
      this.update();
    }.bind(this));

    RiotControl.on('persist_end', function (data) {
      this.persistInProgress = false;
      this.update();
    }.bind(this));

    RiotControl.on('item_current_work_start', function (data) {
      this.workInProgress = true;
      this.update();
    }.bind(this));

    RiotControl.on('item_current_work_done', function (data) {
      this.workInProgress = false;
      this.update();
    }.bind(this));

    RiotControl.on('item_current_work_fail', function () {
      this.workInProgress = false;
      this.update();
    }.bind(this));

    RiotControl.on('ajax_fail', function (message) {
      console.log('navigation.tag | ajax_fail');
      this.errorMessage = message;
      this.update();
    }.bind(this));

    RiotControl.on('navigation_control_done', function (entity,action) {
      this.entity = undefined;
      this.update(); // unmount existing screen
      this.entity = entity;
      this.action=action;
      this.update();
    }.bind(this));

    this.on('mount', function () {
      this.router = route.create()
      route(function (entity, id, action) {
        console.log(entity, id, action);
        //this.routePath=path; this.routeHistory=history;
        if (id == undefined) {
          this.entity = entity;
          this.update();
        } else {
          //console.log('ALLO');
          RiotControl.trigger('navigation', entity, id, action)
        }
        //console.log('ROUTE', path); console.log('history',history)
      }.bind(this));
      route.start(true);
      //RiotControl.trigger('screenHistoryInit');

    });
  </script>
  <style>

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

    /*LANDING CSS */

    #landingTitle {
      text-align: center;
      margin-top: 15vh;
    }

    #landingText {
      text-align: center;
      margin-top: 15vh;
    }

    .containerflexlanding {
      background-color: white;
      width: 100%;
      height: 125vh;
      padding: 0;
      margin: 0;
      display: -webkit-box;
      display: -moz-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .containerlanding {
      height: 90vh!important;
      background-color: white;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    #containerloaderDiv {
      background-color: rgba(200,200,200,0.8);
      width: 100%;
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
      justify-content: center;
    }

    #row {
      display: flex;
      flex-direction: column;
      align-items: center;

    }

    #loaderText {
      padding-top: 5%;
      color: #3498db;
      font-family: 'Raleway', sans-serif;
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
      background-color: orange !important;
      color: white;
      z-index: 999;
    }

    .selectedMenu {
      background-color: rgb(9,245,185);
    }

  </style>
</navigation>
