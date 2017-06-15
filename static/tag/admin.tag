<admin class="containerV">
  <div name="cloneButton" onclick={cloneDatabaseClick} class="selector mainSelector" style="flex-basis:100px">
    <div>clonage de base de donnée</div>
  </div>
  <div name="cheatWorkspaceButton" onclick={cheatWorkspaceClick} class="selector mainSelector" style="flex-basis:100px">
    <div>m'affecter tous les workspaces</div>
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
