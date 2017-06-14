<admin class="containerV">
  <div name="cloneButton" onclick={cloneDataBaseClick} class="selector mainSelector" style="flex-basis:100px">
    <div>clonage de base de donnée</div>
  </div>
  <div name="cheatWorkspaceButton" onclick={cloneDataBaseClick} class="selector mainSelector" style="flex-basis:100px">
    <div>m'affecter tous les workspaces</div>
  </div>

  <script>
    this.on('mount', function () {

    });

    cloneDataBaseClick(e) {
      RiotControl.trigger('clone_database');
    }
  </script>
  <style>

  </style>
</admin>
