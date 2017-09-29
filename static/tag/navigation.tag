<navigation >

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
  <div class="containerH" style="bottom:0;top:0;right:0;left:0;position:absolute;flex-wrap:nowrap;">

    <!--
    <div class="containerV" class="containerV" style="height: 100vh;flex-shrink:5">
      <div class="containerV" style="flex-grow:1;flex-basis:50%">
        <div class="containerH" style="flex-grow:1;flex-wrap: nowrap;">
          <div class="containerV" style="flex-basis:20%" if={isScrennToShow('menu')}>
            <div class="commandBar containerH">
              Menu
            </div>
            <div class="containerH" style="justify-content:space-between">
              <div onclick={workspaceSelectorClick} name="workspaceSelector" class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
                <div>
                  My Workspaces
                </div>
              </div>
            </div>
            <div class="containerH" style="justify-content:space-between">
              <div onclick={workspaceShareSelectorClick} name="workspaceSelector" class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
                <div>
                  Shared Workspaces
                </div>
              </div>
            </div>
            <div class="containerH" style="justify-content:space-between">
              <div onclick={profilSelectorClick} name="profilSelector" class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
                <div>Profil</div>
              </div>
              <div onclick={adminSelectorClick} name="adminSelector" class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;" if={showAdmin}>
                <div>Admin</div>
              </div>
            </div>
          </civ>
        </div>
      -->
    <div class="containerV commandBar" style="justify-content: space-between;">
      <div class="containerV commandGroup" style="flex-grow:0;justify-content:flex-start;">
        <div class="commandButtonImage" onclick={workspaceSelectorClick}>
          <img src="./image/User-256.png" width="60px">
        </div>
        <div class="commandButtonImage" onclick={workspaceShareSelectorClick}>
          <img src="./image/Group-256.png" width="60px">
        </div>
        <div class="commandButtonImage" onclick={profilSelectorClick}>
          <img src="./image/user.png" width="60px">
        </div>
        <div class="commandButtonImage" onclick={adminSelectorClick}>
          <img src="./image/Administrative-Tools-256.png" width="60px">
        </div>
      </div>
      <div class="containerV commandGroup" style="flex-grow:1;justify-content:center;">
        <div onclick={back} if={isScrennHide()} class="commandButtonImage">
          <img src="./image/Super-Mono-png/PNG/basic/blue/arrow-left.png" width="60px">
        </div>
      </div>
      <div class="containerV commandGroup" style="flex-grow:0;justify-content:flex-end;">
        <img src="./image/working.gif" width="60px" if={workInProgress}>
      </div>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('landing')}>
      <landing></landing>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('myWorkspaces')}>
      <workspace-table></workspace-table>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('sharedWorkspaces')}>
      <workspace-share-table></workspace-share-table>
    </div>

    <div class="containerV" style="flex-grow:1" if={isScrennToShow('workspaceEditor')}>
      <workspace-editor></workspace-editor>
    </div>

    <div class="containerV" style="flex-grow:1" if={isScrennToShow('workspaceAddComponent')}>
      <technical-component-table></technical-component-table>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('workspaceAddUser')}>
      <user-list></user-list>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('graph')}>
      <graph></graph>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('componentEditor')}>
      <workspace-component-editor></workspace-component-editor>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('profil')}>
      <profil></profil>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('admin')}>
      <admin></admin>
    </div>
    <div class="containerV" style="flex-grow:1" if={isScrennToShow('workPreview')}>
      <jsonPreviewer></jsonPreviewer>
    </div>
  </div>
</div>
<script>

  this.persistInProgress = false;
  this.workInProgress = false;
  //    this.workspaceComponents = [];

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

  this.isScrennToShow = function (screenToTest) {
    let out = false;
    if (this.screenHistory != undefined) {
      out = sift({
        screen: screenToTest,
        show: true
      }, this.screenHistory).length > 0;
    }

    //console.log('isScrennToShow',screenToTest,out, this.screenHistory);
    return out;
  }

  this.isScrennHide = function () {
    return sift({
      show: false
    }, this.screenHistory).length > 0;
  }

  RiotControl.on('newScreenHistory', function (newScreenHistory) {
    console.log('newScreenHistory', newScreenHistory);
    this.screenHistory = newScreenHistory;
    this.update();
  }.bind(this));

  RiotControl.on('user_authentified', function (data) {
    console.log('user_authentified', localStorage.user_id);
    RiotControl.trigger('load_profil');
  }.bind(this));

  RiotControl.on('profil_loaded', function (data) {
    console.log('profil_loaded', data);
    this.showAdmin = data.admin;
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

  this.on('mount', function () {


    RiotControl.trigger('screenHistoryInit');

  });
</script>
<style>

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

</style>
</navigation>
