<workspace-component-editor class="containerV" style="flex-grow:1">
  <div class="containerH info" style="background: rgb(213,218,224);flex-wrap:wrap;">
    <div class="containerV" style="">
      <label>
        Nom du composant
      </label>
      <div class="containerH" style="justify-content:center;">
      <input class="field" type="text" id="nameComponentInput" onchange={onNameChange} value={itemCurrent.name}></input>
    </div>
  </div>
    <div class="containerV">
      <label >
        Persistance du process (payant)
      </label>
      <div class="containerH" style="justify-content:center;">
        <label class="switch">
          <input type="checkbox" onchange={onPersistProcessChange} checked={itemCurrent.persistProcess}>
          <span class="slider round"></span>
        </label>
      </div>
    </div>
  </div>
  <div id="editionContainer" style="flex-grow:1; padding: 15pt;
    background-color: rgb(238,242,249);" class="containerV">
  </div>
<!-- bouton valider -->
    <div class="containerH" style="height:45px;align-items: center;justify-content: center;flex-grow:0;flex-shrink:0">
      <div onclick={saveClick} class="commandButton containerV">
        <div style="text-align:center">valider</div>
      </div>
    </div>

  <script>
    this.itemCurrent = {};
    this.data = {};

    this.saveClick = function (e) {
      RiotControl.trigger('item_current_persist');
    }
    onNameChange(e) {
      this.itemCurrent.name = e.target.value;
    }

    onPersistProcessChange(e) {
      console.log(e);
      this.itemCurrent.persistProcess = e.target.checked;
    }

    this.mountEdition = function (editor) {
      this.editionContainer = riot.mount('#editionContainer', editor)[0];
    };

    this.itemCurrentEditorChanged = function (editor) {
      this.mountEdition(editor);
      this.update();
    }.bind(this);

    this.itemCurrentChanged = function (item) {
      console.log('item_current_changed', item)
      this.itemCurrent = item;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.itemCurrentChanged);
      RiotControl.on('item_current_editor_changed', this.itemCurrentEditorChanged);
      RiotControl.trigger('component_current_refresh');
    });

    this.on('unmount', function () {
      this.editionContainer.unmount();
      RiotControl.off('item_current_changed', this.itemCurrentChanged);
      RiotControl.off('item_current_editor_changed', this.itemCurrentEditorChanged);
    })
  </script>
  <style>
    .info {
      justify-content: center;
      flex-shrink: 0;

    }
    .info > div {
      padding: 10px;
      flex-grow: 1;

    }

    .input {
      text-align: center;
    }

    label {
      text-align: center;
    }

  </style>

</workspace-component-editor>
