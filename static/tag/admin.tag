<admin class="containerV">
  <div class="commandBar containerH">
    Admin
  </div>
  <div class="containerH" style="justify-content:space-between; flex-shrink:0">
    <div onclick={cloneDatabaseClick} class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
      <div>clonage de base de donnée</div>
    </div>
    <div onclick={cheatWorkspaceClick} class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
      <div>m'affecter tous les workspaces</div>
    </div>
  </div>
  <zenTable style="flex:1" ref="errorsTable" disallowcommand={true} disallownavigation={true}>
    <yield to="header">
      <div>message</div>
      <div>first stack</div>
      <div>date</div>
      <div>userId</div>
    </yield>
    <yield to="row">
      <div style="width:20%">{message}</div>
      <div style="width:60%">{stackArray[0]}</div>
      <div style="width:10%">{date}</div>
      <div style="width:10%">{userId}</div>
    </yield>
  </zenTable>

  <script>

    this.refreshErrorsTable = function (data) {
      //console.log('view', data);
      this.refs.errorsTable.data = data;
    }.bind(this);

    this.on('mount', function () {
      console.log('ALLO');
      RiotControl.trigger('error_load');
      RiotControl.on('error_loaded',this.refreshErrorsTable);
    });

    this.on('unmount', function () {
      RiotControl.off('error_loaded',this.refreshErrorsTable);
    });

    cloneDatabaseClick(e) {
      RiotControl.trigger('clone_database');
    }

    cheatWorkspaceClick(e) {
      RiotControl.trigger('own_all_workspace');
    }
  </script>
  <style>

  </style>
</admin>
