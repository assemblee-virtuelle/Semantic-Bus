<admin class="containerV">
  <div class="commandBar containerH">
    Admin
  </div>
  <div class="containerH" style="justify-content:space-between">
    <div onclick={cloneDatabaseClick} class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
      <div>clonage de base de donnée</div>
    </div>
    <div onclick={cheatWorkspaceClick} class="selector mainSelector" style="padding: 5vh; font-size:1.2em;flex-grow:1;">
      <div>m'affecter tous les workspaces</div>
    </div>
  </div>

  <script>
    this.on('mount', function () {

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
