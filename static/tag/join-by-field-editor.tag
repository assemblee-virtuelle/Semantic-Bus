<join-by-field-editor>
  <div>jointure entre un flux principale et un flux secondaire</div>
  <label>composant qui contient le flux principale</label>
  <select name="primaryComponentIdInput" ref="primaryComponentIdInput">
    <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.innerData.specificData.primaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label>champ du composant principale qui contient l'identifiant du flux secondaire</label>
  <input type="text" name="primaryFlowFKIdInput" value={innerData.specificData.primaryFlowFKId} ref="primaryFlowFKIdInput"></input>
  <label>composant qui contient le flux secondaire</label>
  <select name="secondaryComponentIdInput" ref="secondaryComponentIdInput">
    <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.innerData.specificData.secondaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label>champ du composant secondaire qui défini son identifiant</label>
  <input type="text" name="secondaryFlowIdInput" ref="secondaryFlowIdInput" value={innerData.specificData.secondaryFlowId}></input>
  <label>nom de la propriété accueillant le flux secondaire</label>
  <input type="text" name="primaryFlowFKNameInput" ref="primaryFlowFKNameInput" value={innerData.specificData.primaryFlowFKName}></input>

  <script>

    this.innerData = {};
    this.updateData = function (dataToUpdate) {
      this.innerData = dataToUpdate;
      this.update();
      RiotControl.trigger('component_current_connections_refresh');
    }.bind(this);

    this.updateConnections = function (connections) {

      if(this.innerData.specificData.primaryComponentId==undefined){
        this.innerData.specificData.primaryComponentId=connections.beforeComponents[0]._id;
      }
      if(this.innerData.specificData.secondaryComponentId==undefined){
        this.innerData.specificData.secondaryComponentId=connections.beforeComponents[0]._id;
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
      RiotControl.off('item_current_changed',this.updateData);
      RiotControl.off('component_current_connections_changed', this.updateConnections);
    });
  </script>
</join-by-field-editor>
