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
  <div class="containerV">
    <div class="containerH commandBar errorMessage" if={errorMessage}>
      <div>{errorMessage}</div>
      <div onclick={closeError} class="commandButtonImage" ><img src="./image/Super-Mono-png/PNG/basic/red/button-cross.png" height="20px"></div>
    </div>

    <!--  CONTAINER GENERAL  -->
    <div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute;flex-wrap:nowrap;">
      <div class="containerH" style="background-color: rgb(33,150,243);">

        <!--  HEADER WORKSPACE  -->
        <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('myWorkspaces')}>
          <div  class="header" >
            <div class="containerH commandBar" style="margin-bottom: 15pt;justify-content:center">
               <div><strong>Mes Work</strong>spaces</div>
            </div>
            <div class="containerH commandBar">
              <div></div>
              <div><input class="champ"  type="text" name="inputSearch" ref="inputSearch" placeholder="Search" onkeyup={ filterCards }></div>
              <div onclick={addRowClick} class="buttonBus">
                Add
              </div>
            </div>
          </div>
        </div>

        <!--  HEADER LANDING  -->
        <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;" if={isScrennToShow('landing')}>
          <div  class="header" >
            <div class="containerH commandBar" style="margin-bottom: 15pt;justify-content:center">
              <div><strong>Bienvenue</strong></div>
            </div>
          </div>
        </div>

        <!--  HEADER WORKSPACE SHARE  -->
        <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;"  if={isScrennToShow('sharedWorkspaces')}>
          <div  class="header" >
            <div class="containerH commandBar" style="justify-content: center;flex-direction: column;align-items: center;">
              <div><strong>Mes Work</strong>spaces partagés</div>
              <input class="champ"  type="text" name="inputSearch" ref="inputSearch" placeholder="Search" onkeyup={ filterCards }>
            </div>
          </div>
        </div>

        <!--  HEADER PROFIL  -->
        <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-grow: 1;"  if={isScrennToShow('profil')}>
          <div  class="header" >
            <div class="containerH commandBar" style="justify-content: center;flex-direction: column;align-items: center;">
              <div><strong>Mon espace</strong> personel</div>
            </div>
          </div>
        </div>
      </div>



      <div class="containerH" style="justify-content:center;justify-content: inherit; flex-basis:100%">

      <!--  NAVBAR   -->
        <div class="containerV" style="justify-content: space-between;background-color: rgb(33,150,243);flex-basis:5%">
          <div class="containerV" style="flex-grow:1">
            <div class="commandButtonImage" onclick={workspaceSelectorClick} id="workspaceSelector">
              <img src="./image/dossier.svg" style="    background-color: rgb(33,150,243);" width="40px">
            </div>
            <div class="commandButtonImage" onclick={workspaceShareSelectorClick}>
              <img src="./image/double_dossier.svg" style="    background-color: rgb(33,150,243);" width="40px">
            </div>
            <div class="commandButtonImage" onclick={profilSelectorClick}>
              <img src="./image/photo.svg" style="    background-color: rgb(33,150,243);" width="40px">
            </div>
            <div class="commandButtonImage" onclick={adminSelectorClick} if={showAdmin}>
              <img src="./image/Roulette_bus.svg" style="    background-color: rgb(33,150,243);" width="40px">
            </div>
            <div id="backButton" onclick={back} if={isScrennHide()} class="commandButtonImage">
              <img src="./image/Super-Mono-png/PNG/basic/blue/arrow-left.png" style="    background-color: rgb(33,150,243);" width="40px">
            </div>
            <div class="commandButtonImage" >
              <img src="./image/working.gif" width="60px" if={workInProgress}>
            </div>
          </div>
        </div>

      <!--  CONTENT   -->

      <div class="containerV" style="flex-basis:95%">

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
          <user-list style="height:100%"></user-list>
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

  </div>
</div>
<script>

  this.persistInProgress = false;
  this.workInProgress = false;



  //HEADER EVENT

  filterCards(e){
      RiotControl.trigger('filterCards', e);
  }

  addRowClick(e) {
     RiotControl.trigger('addRowWorkspace')
  }



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

  closeError(e){
    this.errorMessage=undefined;
  }

  this.isScrennToShow = function (screenToTest) {
    let out = false;
    if (this.screenHistory != undefined) {
      out = sift({
        screen: screenToTest,
        show: true
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



  this.on('mount', function () {

    RiotControl.trigger('screenHistoryInit');

  });
</script>
<style>

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

  .errorMessage{
    background-color: orange !important;
    color: white;
    z-index: 999;
  }

</style>
</navigation>
