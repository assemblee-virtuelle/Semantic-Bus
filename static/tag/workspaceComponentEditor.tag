<workspace-component-editor class="containerV" style="flex-grow:1;justify-content:center">

  <div class="containerH info" style="background: rgb(213,218,224);flex-wrap:wrap;flex-shrink:0;flex-grow:0;">
    <div class="containerH" style="justify-content:center;">
      <div class="containerV" style="justify-content:center;margin-right:10px;">
        <label>Nom:
        </label>
      </div>
      <div class="containerV" style="justify-content:center;">
        <input style="height:30px;width:600px;" type="text" id="nameComponentInput" onchange={onNameChange} value={itemCurrent.name} required="required"></input>
      </div>
    </div>

    <div class="containerH" style="justify-content:center">
      <div class="containerV" style="justify-content:center;margin-right:10px;">
        <label >
          Persistance du process (payant)
        </label>
      </div>
      <div class="containerH" style="justify-content:center;">
        <div class="containerV" style="justify-content:center;">
          <label class="switch">
            <input type="checkbox" onchange={onPersistProcessChange} checked={itemCurrent.persistProcess}>
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
  <div style="flex-grow:1; background-color: rgb(238,242,249);" class="containerV">
    <div id="editionContainer" class="box-flex containerV"></div>
  </div>

  <!-- Bouton valider -->
  <div class="containerV" style="flex-shrink:0;flex-grow:0;flex-basis:45px;justify-content:flex-start">
    <div class="containerH" style="justify-content:center">
      <button class="btn" onclick={saveClick} type="button">Valider</button>
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
      justify-content: flex-start;
      flex-shrink: 0;

    }
    .info > div {
      padding: 10px;
      flex-grow: 1;

    }
    .box-flex {
      margin: 20px;
      padding: 20px;
      background-color: white;
      border-radius: 5px;
      border: 1px solid rgba(133,133,133,0.38);
      box-shadow: 0 0 5px 0 rgba(133,133,133,0.38);
    }
  </style>

</workspace-component-editor>
