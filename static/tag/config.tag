<config class="containerV">
  <div name="cloneButton" onclick={cloneDataBaseClick} class="selector mainSelector" style="flex-basis:140px">
    <div>clonage de base de donnée</div>
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
</config>
