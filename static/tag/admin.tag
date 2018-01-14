<admin class="containerH" style="flex-grow:1;flex-wrap:nowrap;">
  <!--<div class="containerH" style="justify-content:space-between; flex-shrink:0">
    <div onclick={cloneDatabaseClick} class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
      <div>clonage de base de donnée</div>
    </div>
    <div onclick={cheatWorkspaceClick} class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
      <div>m'affecter tous les workspaces</div>
    </div>
  </div>-->
  <div class="containerV" style="flex-basis: 70px; background-color: rgb(9,245,185);flex-shrink:0;">
    <div class=" containerV" style="flex-basis:200px; background-color: rgb(9,245,185);flex-grow:0;">
      <a href="#admin//errors" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/Autres.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Ereurs</p>
      </a>
      <a href="#admin//scripts" class="commandButtonImage containerV" style="justify-conte:center; align-tems:center;flex-basis:120px">
        <img src="./image/Roulette_bus.svg" style="margin-bottom: 10px;" height="40px" width="40px">
        <p style="color:white;font-size:12px">Scripts</p>
      </a>
    </div>
  </div>
  <div show={menu=='errors' } style="flex-grow:1;background-color:rgb(238,242,249)" class="containerV">
    <zenTable ref="errorsTable" disallownavigation={true}>
      <yield to="header">
        <div class="containerV;" style="flex-grow:1;">
          <div class="containerH tableHeader">
            <div style="width:200px">date</div>
            <div style="width:200px">userId</div>
            <div style="width:100%">message</div>
          </div>
          <div class="containerH tableHeader">
            <div>first stack</div>
          </div>
        </div>

      </yield>
      <yield to="row">
        <div class="containerV" style="flex-grow:1;">
          <div class="containerH tableRowContent">
            <div style="width:200px">{date}</div>
            <div style="width:200px">{userId}</div>
            <div style="width:100%">{message}</div>
          </div>
          <div class="containerH tableRowContent">
            <div>{stackArray[0]}</div>
          </div>
        </div>
      </yield>
    </zenTable>
  </div>
  <div show={menu=='scripts' } style="flex-grow:1;background-color:rgb(238,242,249)" class="containerV">
    <div class="containerV">
      <div class="containerH commandBar" style="justify-content:flex-end">
        <div class="commandGroup">
          <image src="./image/Roulette_bus.svg" class="commandButtonImage" width="40" height="40" onclick={executeScript}></image>
        </div>
      </div>
      <zenTable ref="dbScriptTable" disallownavigation={true} disallowdelete={true}>
        <yield to="header">
          <div>description</div>
        </yield>
        <yield to="row">
          <div>{desc}</div>
        </yield>
      </zenTable>
    </div>
  </div>

  <script>
    //this.menu='script';

    this.refreshErrorsTable = function (data) {
      console.log('refreshErrorsTable', this.refs);
      //console.log('view', data);
      this.refs.errorsTable.data = data;
      this.update();
    }.bind(this);

    this.refreshDbScriptsTable = function (data) {
      console.log('refreshDbScriptsTable', this);
      this.refs.dbScriptTable.data = data;
      this.update();
    }.bind(this);

    this.adminMenuChanged = function (menu) {
      //console.log('PROFIL MENU CHANGED',menu);
      this.menu = menu;
      this.update();
    }.bind(this);

    this.executeScript = function(e){
      RiotControl.trigger('execute_script',this.scriptsToExecute);
    }

    this.on('mount', function () {
      console.log('MOUNT');
      this.refs.dbScriptTable.on('rowsSelected',(data)=>{
        this.scriptsToExecute=data;
      })
      RiotControl.on('error_loaded', this.refreshErrorsTable);
      RiotControl.on('dbScript_loaded', this.refreshDbScriptsTable);
      RiotControl.on('admin_menu_changed', this.adminMenuChanged);
      RiotControl.trigger('admin_menu_get');
      RiotControl.trigger('dbScript_load');
      RiotControl.trigger('error_load');



    });

    this.on('unmount', function () {
      RiotControl.off('error_loaded', this.refreshErrorsTable);
      RiotControl.off('dbScript_loaded', this.refreshDbScriptsTable);
      RiotControl.off('admin_menu_changed', this.adminMenuChanged);
    });

    cloneDatabaseClick(e) {
      RiotControl.trigger('clone_database');
    }

    cheatWorkspaceClick(e) {
      RiotControl.trigger('own_all_workspace');
    }
  </script>
  <style></style>
</admin>
