<workspace-component-editor class="containerV" style="flex-grow:1">
  <div class="containerH info" style="flex-wrap:wrap;justify-content:space-around">
    <div class="containerV">
      <label>
        nom du composant
      </label>
      <input type="text" id="nameComponentInput" onchange={onNameChange} value={itemCurrent.name}></input>
    </div>
    <div class="containerV">
      <label >
        persistance du process (payant)
      </label>
      <div class="containerH">
        <label class="switch">
          <input type="checkbox" onchange={onPersistProcessChange} checked={itemCurrent.persistProcess}>
          <span class="slider round"></span>
        </label>
      </div>
    </div>
  </div>
  <div id="editionContainer" style="flex-grow:1; padding: 15pt; background-color: rgb(238,242,249);" class="containerV"></div>
  <script>
    this.itemCurrent = {};

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
      flex-shrink: 0;
    }
    .info > div {
      padding: 5px;
      border-style: solid;
      border-width: 1px;
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
