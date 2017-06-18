<navigation >

  <div class="containerV" style="bottom:0;top:0;right:0;left:0;position:absolute;">
  <!-- <div class="containerlanding" if={landingPage}>
    <div id="row">
      <h1 id="landingTitle"> Bienvenue sur le Bus Semantique </h1>
  </div>
    <div class="containerflexlanding">
      <div onclick={workspaceSelectorClick} name="workspaceSelector" class="selector mainSelector" style="flex-basis:100px">
        <div>Mes Workspaces</div>
      </div>
      <div onclick={technicalComponentSelectorClick} name="technicalComponentSelector" class="selector mainSelector" style="flex-basis:100px">
        <div>Composant Technique</div>
      </div>
      <div onclick={profilSelectorClick} name="profilSelector" class="selector mainSelector" style="flex-basis:100px">
        <div>Mon profil</div>
      </div>
      <div onclick={adminSelectorClick} name="adminSelector" class="selector mainSelector" style="flex-basis:100px">
        <div>Admin</div>
      </div>
    </div>
  </div> -->
  <div id="containerloaderDiv">
    <div id="row">
      <div id="loaderDiv"></div>
      <h1 id="loaderText"> Sécurisation de l'application en cour </h1>
    </div>
  </div>
  <div class="containerV" class="containerV" style="height: 100vh;flex-shrink:5">
    <div if={modeNavigation} class="containerV" style="flex-grow:1;flex-basis:50%">
      <div class="containerH" style="flex-grow:1;flex-wrap: nowrap;">
        <div class="containerV commandBar" style="flex-basis:10px" if={modeMenuHide}>
          <div></div>
          <div class="commandGroup" class="containerH">
            <div onclick={showMenu} class="commandButton">
              >
            </div>
          </div>
          <div></div>
        </div>
        <div class="containerV" style="flex-basis:20%" if={!modeMenuHide}>
          <div class="commandBar containerH">
            menu
          </div>

          <div onclick={workspaceSelectorClick} name="workspaceSelector" class="selector mainSelector" style="flex-basis:100px">
            <div>Mes Workspaces</div>
          </div>
          <div onclick={technicalComponentSelectorClick} name="technicalComponentSelector" class="selector mainSelector" style="flex-basis:100px">
            <div>Composant Technique</div>
          </div>
          <div onclick={profilSelectorClick} name="profilSelector" class="selector mainSelector" style="flex-basis:100px">
            <div>Mon profil</div>
          </div>
          <div onclick={adminSelectorClick} name="adminSelector" class="selector mainSelector" style="flex-basis:100px" if={showAdmin}>
            <div>Admin</div>
          </div>
        </div>
        <div class="containerV" style="flex-grow:1" if={!modeWorkspaceNavigation && !modeWorkspaceEdition && !modeTechnicalComponentNavigation && !modeProfilEdition && !modeAdminNavigation}>
          <landing></landing>
        </div>
        <div class="containerV" style="flex-grow:1" if={modeWorkspaceNavigation}>
          <workspace-table></workspace-table>
        </div>
        <div class="containerV" style="flex-grow:1" if={modeWorkspaceEdition}>
          <workspace-editor></workspace-editor>
        </div>
        <div class="containerV" style="flex-grow:1" if={modeTechnicalComponentNavigation}>
          <technical-component-table></technical-component-table>
        </div>
        <div class="containerV" style="flex-grow:1" id="detailContainer" if={modeProfilEdition}>
          <profil></profil>
        </div>
        <div class="containerV" style="flex-grow:1" id="detailContainer" if={modeAdminNavigation}>
          <admin></admin>
        </div>

      </div>
    </div>

    <div style="flex-grow:1; flex-basis:50%" class="containerV" if={modeEdition}>
      <div class="containerH commandBar" style="flex-basis:50px">
        <div class="commandGroup" class="containerH"></div>
        <div class="commandTitle">
          {editorTitle}
        </div>
        <div class="commandGroup containerH">
          <div onclick={nagivationClick} class="commandButton">
            back to navigation
          </div>
          <div onclick={testPullClick} class="commandButton">
            tester un flux tiré
          </div>
          <div onclick={saveEditionContainerClick} class={ commandButton: true, persistInProgress: persistInProgress } name="saveButton">
            save
          </div>
        </div>
      </div>
      <div style="flex-grow:1" if={modeGraph}>
        <graph></graph>
      </div>
      <div style="flex-grow:1;flex-wrap: nowrap" class="containerH" if={!modeGraph}>
        <div style="flex-basis:200px" class="containerV" if={modeComponentNetwork && modeConnectBefore}>
          <div class="containerH commandBar" style="flex-basis:50px">
            <div class="commandGroup containerH">
              <div onclick={cancelConnectBeforeClick} class="commandButton">
                cancel
              </div>
            </div>
          </div>
          <div onclick={componentClick} class="selector" each={workspaceComponents}>
            {type} : {name}
          </div>
        </div>
        <div style="flex-basis:200px" class="containerV" if={modeComponentNetwork && !modeConnectBefore}>
          <div class="containerH commandBar" style="flex-basis:50px">
            <div class="commandGroup containerH">
              <div onclick={connectBeforeClick} class="commandButton">
                connect before
              </div>
            </div>
          </div>
          <div onclick={navigateWorkspaceComponentClick} class="selector" each={itemCurrent.connectionsBefore}>
            {type} : {name}
          </div>
        </div>
        <div id="editionContainer" style="flex-grow:1" class="containerV">
          <!--<workspace-editor if={modeWorkspaceEdition}></workspace-editor>-->

        </div>
        <div if={modeComponentTest} style="flex-grow:2;flex-wrap: nowrap;" class="containerH">
          <!--<jsonPreviewer name="testPreviewer" style="flex-grow:1">
        </jsonPreviewer>-->
          <div class="containerV commandBar" style="flex-basis:50px">
            <div></div>
            <div class="commandGroup" class="containerH">
              <div onclick={closeTest} class="commandButton">
                >
              </div>
            </div>
            <div></div>
          </div>

          <jsonEditor name="testPreviewer" mode="text" style="flex-grow:1"></jsonEditor>

        </div>
        <div style="flex-basis:200px" class="containerV" show={modeComponentNetwork && !modeConnectAfter}>
          <div class="containerH commandBar" style="flex-basis:50px">
            <div class="commandGroup containerH">
              <div onclick={connectAfterClick} class="commandButton">
                connect after
              </div>
            </div>
          </div>
          <div onclick={navigateWorkspaceComponentClick} class="selector" each={itemCurrent.connectionsAfter}>
            {type} : {name}
          </div>
        </div>
        <div style="flex-basis:200px" class="containerV" if={modeComponentNetwork && modeConnectAfter}>
          <div class="containerH commandBar" style="flex-basis:50px">
            <div class="commandGroup containerH">
              <div onclick={cancelConnectAfterClick} class="commandButton">
                cancel
              </div>
            </div>
          </div>
          <div onclick={componentClick} class="selector" each={workspaceComponents}>
            {type} : {name}
          </div>
        </div>
      </div>
      <div style="flex-basis:200px" class="containerH" show={modeComponentNetwork}>
        <div style="flex-grow:1">
          <label>nom du composant</label>
          <input type="text" name="nameComponentInput" value={itemCurrent.name}></input>
        </div>
      </div>
    </div>
  </div>

  <script>
    this.modeNavigation = true;
    this.modeEdition = false;
    this.landingPage = true;
    this.modeComponentNetwork = false;
    this.modeComponentTest = false;
    this.modeProfilEdition = false;
    this.modeWorkspaceNavigation = false;
    this.modeTechnicalComponentNavigation = false;
    this.modeAdminNavigation = false;
    this.modeWorkspaceEdition = false;
    this.modeWorkspaceComponentEdition = false;


    this.editorTitle = "";
    this.persistInProgress = false;
    this.itemCurrent; //TODO create a specific component for item with connections
    this.workspaceComponents=[];

    this.showAdmin=false;

    RiotControl.on("ajax_receipt", function(){
      console.log("in hide");
      $("#containerloaderDiv").hide();
      this.update()
    }.bind(this));

    RiotControl.on("ajax_send", function(){
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

    // this.cleanNavigation = function () {   if (this.profilNavigator) {     if (this.profilNavigator.ismounted) {       this.profilNavigator.unmount(true);     }   }   if (this.contentNavigator.ismounted) {     this.contentNavigator.unmount(true);   }
    //  /*if(this.editionContainer.isMounted){   this.editionContainer.unmount(true); }*/   if (this.detailContainer.isMounted) {     this.detailContainer.unmount(true);   } }.bind(this);

    saveEditionContainerClick(e) {
      if (this.editionContainer.persist == undefined) {
        var data = this.editionContainer.data;
        console.log('saveEditionContainerClick : ', data);
        for (var property in data) {
          RiotControl.trigger('item_current_updateField', {
            field: property,
            data: data[property]
          });
        }
        console.log('saveEditionContainerClick | ', this);
        RiotControl.trigger('item_current_updateField', {
          field: 'name',
          data: this.itemCurrent.name
        });
        RiotControl.trigger('item_current_persist');
      } else {
        this.editionContainer.persist();
      }
    }

    nagivationClick(e) {
      RiotControl.trigger('item_current_cancel');
      //this.mountWorkspaceNavigator(false);
    }

    closeTest(e) {
      this.modeComponentTest = false;
      this.update();
    }
    testPullClick(e) {
      if (this.editionContainer.testPullClick == undefined) {
        var data = this.editionContainer.data;
        //console.log('saveEditionContainerClick : ', data );
        RiotControl.trigger('item_current_testPull');

      } else {
        this.editionContainer.testPullClick();

      }
    }

    //TODO je pense que ca ne sert plus : tenter de commenter
    navigateWorkspaceComponentClick(e) {
      RiotControl.trigger('item_current_editById', e.item._id.$oid);
    }

    connectBeforeClick(e) {
      RiotControl.trigger('item_current_connect_before');
    }
    cancelConnectBeforeClick(e) {
      RiotControl.trigger('item_current_cancel_connect_before');
    }
    connectAfterClick(e) {
      RiotControl.trigger('item_current_connect_after');
    }

    cancelConnectBeforeClick(e) {
      RiotControl.trigger('item_current_cancel_connect_after');
    }
    componentClick(e){
      //console.log("componentClick",e.item);
      RiotControl.trigger('item_current_click',e.item);
    }

    profilSelectorClick(e) {
      RiotControl.trigger('profil_show');
    }
    workspaceSelectorClick(e) {
      RiotControl.trigger('workspace_show');
    }
    technicalComponentSelectorClick(e) {
      RiotControl.trigger('technicalComponent_show');
    }
    adminSelectorClick(e) {
      RiotControl.trigger('admin_show');
    }

    showMenu(e){
      RiotControl.trigger('menu_show');
    }

    // this.selectTechnicalComponentMode=function(){   //console.log('selectTechnicalComponentMode');   //this.cleanNavigation();   this.contentNavigator =riot.mount("#contentNavigator", 'technical-component-table')[0]; }.bind(this);

    this.mountEdition = function (componentName) {
      //console.log('mountEdition | ', componentName,this.editionContainer);
      this.editionContainer = riot.mount('#editionContainer', componentName)[0];
      console.log('mountEdition | ', componentName,this.editionContainer);
      this.editorTitle = this.editionContainer.title;

      //RiotControl.trigger('navigation_mode_edition_only');
      //this.modeEdition=true; this.modeNavigation=false;
    };

    // this.mountWorkspaceNavigator = function (syncFromServer) {   this.cleanNavigation();   this.contentNavigator = riot.mount('#contentNavigator', 'workspace-table')[0];   this.contentNavigator.on('newWorkspace', function (message) {
    // this.mountEdition('workspace-editor');     this.modeComponentNetwork = false;     this.update();   }.bind(this));   this.contentNavigator.on('selectWorkspace', function (message) {     if (!this.detailContainer.isMounted) {
    // this.detailContainer = riot.mount("#detailContainer", 'workspace-editor')[0];     }   }.bind(this)); }.bind(this);

    this.on('mount', function () {
      RiotControl.on('user_authentified', function (data) {
        console.log('user_authentified',localStorage.user_id);
        RiotControl.trigger('load_profil');
      }.bind(this));

      RiotControl.on('profil_loaded', function (data) {
        console.log('profil_loaded',data);
        this.showAdmin=data.user.admin;
        this.update();
      }.bind(this));


      RiotControl.on('item_current_testPull_done', function (data) {
        this.modeComponentTest = true;
        //console.log('item_current_testPull_done | data :',data);
        this.tags.testPreviewer.data = data;
        this.update();
      }.bind(this));

      RiotControl.on('navigator_mount', function (webComponentName) {
        console.log('navigator_mount');
        this.cleanNavigation();
        this.contentNavigator = riot.mount('#contentNavigator', webComponentName)[0];
      }.bind(this));

      RiotControl.on('item_current_edit_mode', function (itemType, item) {
        console.log('item_current_edit_mode');
        var tagName;
        switch (itemType) {
          case 'generic':
            //console.log('item_current_edit_mode generic :',item);
            if (item.editor != undefined) {
              tagName = item.editor;
            } else {
              tagName = 'no-editor';
            }
            //this.modeComponentNetwork=true;
            break;
          default:
            tagName = 'no-editor'
            //this.modeComponentNetwork=false;
            break;
        }
        //console.log('item_current_edit_mode | modeComponentNetwork :',this.modeComponentNetwork);
        this.mountEdition(tagName);
        this.update();
      }.bind(this));

      RiotControl.on('item_current_changed', function (item) {
        this.itemCurrent = item;
        this.update();
      }.bind(this));

      // RiotControl.on('workspace_current_changed', function (item) {
      //   //if (!this.detailContainer.isMounted) {  this.detailContainer = riot.mount("#detailContainer", 'workspace-editor')[0]; }
      // }.bind(this));

      RiotControl.on('persist_start', function (data) {
        //console.log('persist_start | ',this.saveButton)
        this.persistInProgress = true;
        this.update();
      }.bind(this));

      RiotControl.on('persist_end', function (data) {
        this.persistInProgress = false;
        this.update();
      }.bind(this));

      RiotControl.on('workspace_current_changed',function(data){
        console.log('navigation | workspace_current_changed',data);
        this.workspaceComponents=data.components;
        this.update();
      }.bind(this));

      RiotControl.on('navigation_mode_changed', function (data) {
        console.log('navigation_mode_changed : ', data);
        this.modeNavigation = data.modeNavigation;
        this.modeEdition = data.modeEdition;
        this.modeComponentNetwork = data.modeComponentNetwork;
        this.modeComponentTest = data.modeComponentTest;
        this.modeProfilEdition = data.modeProfilEdition;
        this.modeWorkspaceNavigation = data.modeWorkspaceNavigation;
        this.modeTechnicalComponentNavigation = data.modeTechnicalComponentNavigation;
        this.modeAdminNavigation = data.modeAdminNavigation;
        this.modeWorkspaceEdition = data.modeWorkspaceEdition;
        this.modeWorkspaceComponentEdition = data.modeWorkspaceComponentEdition;
        this.modeConnectBefore = data.modeConnectBefore,
        this.modeConnectAfter = data.modeConnectAfter,
        this.modeMenuHide=data.modeMenuHide;
        this.modeGraph=data.modeGraph;
        //console.log(this.modeNavigation);
        this.update();
      }.bind(this));

      // this.workspaceSelector.addEventListener('click', function (e) {   this.modeProfilEdition = false;   //clean navigation not work if(this.profilNavigator){   console.log(this.profilNavigator);   this.profilNavigator.unmount(true); }   this.update();
      // this.mountWorkspaceNavigator(); }.bind(this)); this.profilSelector.addEventListener('click', function (e) {   //  this.modeProfilEdition = true; this.profilNavigator = riot.mount("#detailContainer", 'profil-tag')[0];  this.update();
      // RiotControl.trigger('profil_show'); }.bind(this));

      // this.technicalComponentSelector.addEventListener('click', function (e) {
      //   // this.modeProfilEdition = false; clean navigation not work if(this.profilNavigator){     console.log(this.profilNavigator);     this.profilNavigator.unmount(true);   } this.update(); this.contentNavigator = riot.mount("#contentNavigator",
      //   // 'technical-component-table')[0];
      //   RiotControl.trigger('technicalComponent_show');
      // }.bind(this));
      //
      this.nameComponentInput.addEventListener('change', function (e) {
        this.itemCurrent.name = e.currentTarget.value;
      }.bind(this));

    });
  </script>
  <style>


  /*LANDING CSS */

  #landingTitle {
    text-align:center;
    margin-top: 15vh;
  }

  #landingText {
    text-align:center;
    margin-top: 15vh;
  }

    .containerflexlanding {
    background-color:white;
    width:100%;
    height:125vh;
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
    height:90vh!important;
    background-color:white;
    width:100%;
    height:100%;
    padding: 0;
    margin: 0;
  }

  #containerloaderDiv {
    background-color:rgba(200,200,200,0.8);
    width:100%;
    height:125vh;
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
    width: auto;
  }

  #loaderText {
    padding-top:5%;
    color:#3498db;
    font-family: 'Raleway', sans-serif;
    text-align:center;
  }
  #loaderDiv {
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    margin-left:13vw
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
    .persistInProgress {
      color: red;
    }

  </style>
</navigation>
