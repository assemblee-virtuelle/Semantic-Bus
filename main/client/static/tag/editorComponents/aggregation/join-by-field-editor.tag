<join-by-field-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Join" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">Composant qui contient le flux principal:</label>
  <div class="cardInput">
    <select class="inputComponents" name="primaryComponentIdInput" ref="primaryComponentIdInput">
      <option value="undefined">non-défini</option>
      <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.data.specificData.primaryComponentId ==option._id}>{option.type} : {option.name}</option>
    </select>
  </div>
  <label class="labelFormStandard">Champ du composant principal qui contient l'identifiant du flux secondaire:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" name="primaryFlowFKIdInput" value={data.specificData.primaryFlowFKId} ref="primaryFlowFKIdInput"></input>
  </div>
  <label class="labelFormStandard">Composant qui contient le flux secondaire:</label>
  <div class="cardInput">
    <select class="inputComponents" name="secondaryComponentIdInput" ref="secondaryComponentIdInput">
      <option value="undefined">non-défini</option>
      <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.data.specificData.secondaryComponentId ==option._id}>{option.type} : {option.name}</option>
    </select>
  </div>
  <label class="labelFormStandard">Champ du composant secondaire qui définit son identifiant:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" name="secondaryFlowIdInput" ref="secondaryFlowIdInput" value={data.specificData.secondaryFlowId}></input>
  </div>
  <label class="labelFormStandard">Nom de la propriété accueillant le flux secondaire:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" name="primaryFlowFKNameInput" ref="primaryFlowFKNameInput" value={data.specificData.primaryFlowFKName}></input>
  </div>
  <div class="containerH" style="align-items:center;">
    <label class="labelFormStandard">Relation multiple:</label>
    <label class="switch" style="margin-left:10px;">
      <input type="checkbox" onchange={onMultipleJoinChange} checked={data.specificData.multipleJoin}>
      <span class="slider round"></span>
    </label>
  </div>
  <script>

    this.data = {};
    this.updateData = function (dataToUpdate) {
      console.log("data update", dataToUpdate)
      this.data = dataToUpdate;
      this.update();
      RiotControl.trigger('component_current_connections_refresh');
    }.bind(this);

    onMultipleJoinChange(e) {
      this.data.specificData.multipleJoin = e.target.checked;
    }.bind(this);

    this.updateConnections = function (connections) {

      if (this.data.specificData.primaryComponentId == undefined && connections.beforeComponents[0]) {
        this.data.specificData.primaryComponentId = connections.beforeComponents[0]._id;
      }
      if (this.data.specificData.secondaryComponentId == undefined && connections.beforeComponents[0]) {
        this.data.specificData.secondaryComponentId = connections.beforeComponents[0]._id;
      }
      this.linkedComponents = connections;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.refs.primaryComponentIdInput.addEventListener('change', function (e) {
        this.data.specificData.primaryComponentId = e.currentTarget.value;
      }.bind(this));

      this.refs.primaryFlowFKIdInput.addEventListener('change', function (e) {
        this.data.specificData.primaryFlowFKId = e.currentTarget.value;
      }.bind(this));

      this.refs.secondaryComponentIdInput.addEventListener('change', function (e) {
        this.data.specificData.secondaryComponentId = e.currentTarget.value;
      }.bind(this));

      this.refs.secondaryFlowIdInput.addEventListener('change', function (e) {
        this.data.specificData.secondaryFlowId = e.currentTarget.value;
      }.bind(this));

      this.refs.primaryFlowFKNameInput.addEventListener('change', function (e) {
        this.data.specificData.primaryFlowFKName = e.currentTarget.value;
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
