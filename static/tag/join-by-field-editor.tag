<join-by-field-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Join" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Join</div>
  <!-- Champ du composant -->
  <div>Jointure entre un flux principale et un flux secondaire.</div>
  <label>Composant qui contient le flux principale:</label>
  <select name="primaryComponentIdInput" ref="primaryComponentIdInput">
    <option value="undefined">non-défini</option>
    <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.innerData.specificData.primaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label>Champ du composant principale qui contient l'identifiant du flux secondaire:</label>
  <input type="text" name="primaryFlowFKIdInput" value={innerData.specificData.primaryFlowFKId} ref="primaryFlowFKIdInput"></input>
  <label>Composant qui contient le flux secondaire:</label>
  <select name="secondaryComponentIdInput" ref="secondaryComponentIdInput">
    <option value="undefined">non-défini</option>
    <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.innerData.specificData.secondaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label>Champ du composant secondaire qui défini son identifiant:</label>
  <input type="text" name="secondaryFlowIdInput" ref="secondaryFlowIdInput" value={innerData.specificData.secondaryFlowId}></input>
  <label>Nom de la propriété accueillant le flux secondaire:</label>
  <input type="text" name="primaryFlowFKNameInput" ref="primaryFlowFKNameInput" value={innerData.specificData.primaryFlowFKName}></input>
  <div class="containerH" style="align-items:center;">
    <label>Relation multiple:</label>
    <label class="switch" style="margin-left:10px;">
      <input type="checkbox" onchange={onMultipleJoinChange} checked={innerData.specificData.multipleJoin}>
      <span class="slider round"></span>
    </label>
  </div>
  <script>

    this.innerData = {};
    this.updateData = function (dataToUpdate) {
      this.innerData = dataToUpdate;
      this.update();
      RiotControl.trigger('component_current_connections_refresh');
    }.bind(this);

    onMultipleJoinChange(e) {
      console.log(e);
      this.innerData.specificData.multipleJoin = e.target.checked;
    }.bind(this);

    this.updateConnections = function (connections) {

      if (this.innerData.specificData.primaryComponentId == undefined) {
        this.innerData.specificData.primaryComponentId = connections.beforeComponents[0]._id;
      }
      if (this.innerData.specificData.secondaryComponentId == undefined) {
        this.innerData.specificData.secondaryComponentId = connections.beforeComponents[0]._id;
      }
      this.linkedComponents = connections;
      this.update();
    }.bind(this);

    Object.defineProperty(this, 'data', {
      set: function (data) {
        console.log(data);
        this.innerData = data;
        this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function () {
      this.refs.primaryComponentIdInput.addEventListener('change', function (e) {
        this.innerData.specificData.primaryComponentId = e.currentTarget.value;
      }.bind(this));

      this.refs.primaryFlowFKIdInput.addEventListener('change', function (e) {
        this.innerData.specificData.primaryFlowFKId = e.currentTarget.value;
      }.bind(this));

      this.refs.secondaryComponentIdInput.addEventListener('change', function (e) {
        this.innerData.specificData.secondaryComponentId = e.currentTarget.value;
      }.bind(this));

      this.refs.secondaryFlowIdInput.addEventListener('change', function (e) {
        this.innerData.specificData.secondaryFlowId = e.currentTarget.value;
      }.bind(this));

      this.refs.primaryFlowFKNameInput.addEventListener('change', function (e) {
        this.innerData.specificData.primaryFlowFKName = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
      RiotControl.on('component_current_connections_changed', this.updateConnections);

    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('component_current_connections_changed', this.updateConnections);
    });
  </script>
</join-by-field-editor>
