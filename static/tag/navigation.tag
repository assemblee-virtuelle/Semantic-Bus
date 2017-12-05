<navigation>

  <div id="containerSecureDiv" if={userAuthentified!=true} class="containerV" style="justify-content:center">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText">
        Sécurisation de l'application en cour
      </h1>
    </div>
  </div>
  <div id="containerLoaderDiv" if={persistInProgress} class="containerV" style="justify-content:center">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText">
        synchronisation avec le serveur
      </h1>
    </div>
  </div>
  <div id="containerErrorDiv" class="containerV" >
    <div class="containerH commandBar errorMessage" if={errorMessage} style="pointer-events:auto;">
      <div>{errorMessage}</div>
      <div onclick={closeError} class="commandButtonImage"><img src="./image/Super-Mono-png/PNG/basic/red/button-cross.png" height="20px"></div>
    </div>
  </div>

  <div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute">

    <div class="containerH header" style="background-color: rgb(33,150,243);flex-wrap:nowrap;flex-shrink : 0; flex-basis:100px;">
      <workspace-table-header  if={isScrennToShow('myWorkspaces')}></workspace-table-header>
      <landing-header if={isScrennToShow('landing')}></landing-header>
      <workspace-share-table-header if={isScrennToShow('sharedWorkspaces')}></workspace-share-table-header>
      <profil-header if={isScrennToShow('profil')}></profil-header>
      <workspace-editor-header if={isScrennToShow('workspace')}></workspace-editor-header>
      <workspace-component-editor-header if={isScrennToShow('component')}></workspace-component-editor-header>
      <json-previewer-header if={isScrennToShow('workPreview')}></json-previewer-header>
    </div>

    <div class="containerH" style="flex-grow:1;flex-shrink:1;">

      <!--  NAVBAR   -->
      <div class="containerV" style="justify-content: space-between;background: linear-gradient(180deg, rgb(33,150,243) 20% ,rgb(41,181,237));flex-basis:80px;flex-shrink:0">
        <!--<div class="containerV" style="flex-grow:1">-->
        <div class="containerV" style="flex-grow:1;justify-content: flex-start">
          <!--<div class={commandButtonImage:true,selectedMenu:isScrennInHistory('myWorkspaces'),containerV:true} onclick={workspaceSelectorClick} id="workspaceSelector" style="flex-basis:150px;justify-content:center;align-items:center">
            <img src="./image/dossier.svg" style="margin-bottom:10px" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px">Worksapces</p>
          </div>-->
          <a href="#myWorkspaces" class="commandButtonImage {selectedMenu:isScrennInHistory('myWorkspaces')} containerV" id="workspaceSelector" style="flex-basis:100px;flex-grow:0;">
            <img src="./image/dossier.svg" style="" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px">Worksapces</p>
          </a>

          <a href="#sharedWorkspaces" class="commandButtonImage {selectedMenu:isScrennInHistory('sharedWorkspaces')} containerV" style="flex-basis:100px;flex-grow:0;">
            <img src="./image/double_dossier.svg" style="" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px;text-align:center">Worksapces Partagé</p>
          </a>
          <a href="#profil//running" class="commandButtonImage {selectedMenu:isScrennInHistory('profil')} containerV" style="flex-basis:100px;flex-grow:0;">
            <img src="./image/photo.svg" style="" width="40px">
            <p show={isPrincipalMenu} style="color:white;font-size:12px">Profil</p>
          </a>
          <!--  ADMIN  -->
          <a href="#admin" class="commandButtonImage {selectedMenu:isScrennInHistory('admin')} containerV" if={showAdmin} style="flex-basis:100px;flex-grow:0;">
            <img src="./image/Roulette_bus.svg" style="" width="40px">
            <p style="color:white;font-size:12px">Paramêtres</p>
          </a>
        </div>
        <div class="containerV" style="flex-basis:40px;">
          <div class="commandButtonImage" style="flex-basis:120px">
            <img src="./image/working.gif" width="40px" if={workInProgress}>
          </div>
        </div>
      </div>

      <!--  CONTENT   -->

      <div class="containerV" style="flex-grow:1">
        <landing if={isScrennToShow('landing')}></landing>
        <workspace-table if={isScrennToShow('myWorkspaces')></workspace-table>
        <workspace-share-table if={isScrennToShow('sharedWorkspaces')></workspace-share-table>
        <workspace-editor if={isScrennToShow('workspace')}></workspace-editor>
        <graph if={isScrennToShow('graph')}></graph>
        <workspace-component-editor if={isScrennToShow('component')}></workspace-component-editor>
        <profil if={isScrennToShow('profil')}></profil>
        <admin if={isScrennToShow('admin')}></admin>
        <jsonPreviewer if={isScrennToShow('workPreview')}></jsonPreviewer>
      </div>


    </div>
  </div>
  <script>

    this.persistInProgress = false;
    this.workInProgress = false;
    // this.isPrincipalMenu = true;
    // this.workspaceName = ""
    // this.actionReady = false;

    //HEADER EVENT

    // filterCards(e) {
    //   RiotControl.trigger('nav_filterCards', e);
    // }

    // addRowClick(e) {
    //   RiotControl.trigger('nav_addRowWorkspace')
    // }

    // persistClick(e) {
    //   RiotControl.trigger('nav_persisteWorkspace')
    // }

    // addComponent(e) {
    //   console.log("In navigation")
    //   RiotControl.trigger("add_component_click")
    // }

    // RiotControl.on("workspace_current_select_done", function (res) {
    //   this.workspaceName = res.name
    //   this.update()
    // }.bind(this))

    // share(e) {
    //   console.log("share navigation")
    //   RiotControl.trigger("nav_share_workspace")
    //   this.update()
    // }.bind(this)

    // saveWorkspaceComponent(e) {
    //   console.log("saveWorkspaceComponent nav tag")
    //   RiotControl.trigger("nav_component_workspace_editor")
    // }

    // RiotControl.on("row_add_component_select", function () {
    //   console.log("row_add_component_select TEST")
    //   this.actionReady = true;
    //   this.update()
    // }.bind(this))

    // RiotControl.on("ajax_receipt", function () {
    //   console.log("in hide");
    //   $("#containerloaderDiv").hide();
    //   this.update()
    // }.bind(this));
    //
    // RiotControl.on("ajax_send", function () {
    //   console.log("in show");
    //   $("#containerloaderDiv").show();
    //   this.update()
    // }.bind(this));
    ////TEST LOGIN ////
    this.isGoodUser = function () {
      RiotControl.trigger('is_token_valid?');
    }

    //don't work if is placed in mount
    this.isGoodUser();

    // profilSelectorClick(e) {
    //   RiotControl.trigger('profil_show');
    // }
    // workspaceSelectorClick(e) {
    //   RiotControl.trigger('workspace_show');
    // }
    //
    // workspaceShareSelectorClick(e) {
    //   RiotControl.trigger('workspace_share_show');
    // }
    // technicalComponentSelectorClick(e) {
    //   RiotControl.trigger('technicalComponent_show');
    // }
    // adminSelectorClick(e) {
    //   RiotControl.trigger('admin_show');
    // }
    //
    // showMenu(e) {
    //   RiotControl.trigger('menu_show');
    // }
    //
    // back(e) {
    //   RiotControl.trigger('back');
    // }

    closeError(e) {
      this.errorMessage = undefined;
    }

    this.isScrennToShow = function (screenToTest) {
      // let out=false; //console.log(this.routePath); if(this.screen!=undefined && this.screen.indexOf(screenToTest)!=-1){   out=true; }
      return screenToTest == this.entity;
      //console.log('router',this.router.hist); let out = false; if (this.screenHistory != undefined) {   out = sift({     screen: screenToTest,     show: true   }, this.screenHistory).length > 0; } return out;
    }

    this.isScrennInHistory = function (screenToTest) {
      // let out = false;
      // if (this.screenHistory != undefined) {
      //   out = sift({
      //     screen: screenToTest
      //   }, this.screenHistory).length > 0;
      // }
      // return out;
      return screenToTest == this.entity;
    }

    // this.isScrennHide = function () {
    //   return sift({
    //     show: false
    //   }, this.screenHistory).length > 0;
    // }

    // RiotControl.on('newScreenHistory', function (newScreenHistory) {
    //   //console.log('newScreenHistory', newScreenHistory[newScreenHistory.length -1].screen);workspaceAddComponent
    //   this.screenHistory = newScreenHistory;
    //   if (newScreenHistory[newScreenHistory.length - 1].screen == "workspaceAddComponent" || newScreenHistory[newScreenHistory.length - 1].screen == "landing" || newScreenHistory[newScreenHistory.length - 1].screen == "myWorkspaces" || newScreenHistory[newScreenHistory.length - 1].screen == "sharedWorkspaces") {
    //     //console.log("IN IF")
    //     this.isPrincipalMenu = true
    //   } else {
    //     this.isPrincipalMenu = false
    //   }
    //   this.update();
    // }.bind(this));

    RiotControl.on('user_authentified', function (data) {
      console.log('user_authentified', localStorage.user_id);
      this.userAuthentified=true;
      this.update();
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
        if (id == undefined && action == undefined) {
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
    /*
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
    }*/

    #containerSecureDiv {
      background-color: rgba(200,200,200,1);
      bottom:0;
      top:0;
      right:0;
      left:0;
      position:absolute;
      z-index: 3;

    }

    #containerErrorDiv {
      background-color: rgba(200,200,200,0);
      bottom:0;
      top:0;
      right:0;
      left:0;
      position:absolute;
      z-index: 2;
      pointer-events:none;
    }
    #containerErrorDiv {
      background-color: rgba(200,200,200,0);
      bottom:0;
      top:0;
      right:0;
      left:0;
      position:absolute;
      z-index: 2;
    }
    #containerLoaderDiv {
      background-color: rgba(200,200,200,0.6);
      bottom:0;
      top:0;
      right:0;
      left:0;
      position:absolute;
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
