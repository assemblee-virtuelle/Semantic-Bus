<join-by-field-editor>
  <div>jointure entre un flux principale et un flux secondaire</div>
  <label>composant qui contient le flux principale</label>
  <select name="primaryComponentIdInput" ref="primaryComponentIdInput">
    <option each={option in data.connectionsBefore} value={option._id} selected={parent.data.specificData.primaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label>champ du composant principale qui contient l'identifiant du flux secondaire</label>
  <input type="text" name="primaryFlowFKIdInput" value={data.specificData.primaryFlowFKId} ref="primaryFlowFKIdInput"></input>
  <label>composant qui contient le flux secondaire</label>
  <select name="secondaryComponentIdInput" ref="secondaryComponentIdInput">
    <option each={option in data.connectionsBefore} value={option._id} selected={parent.data.specificData.secondaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label>champ du composant secondaire qui défini son identifiant</label>
  <input type="text" name="secondaryFlowIdInput" ref="secondaryFlowIdInput" value={data.specificData.secondaryFlowId}></input>
  <label>nom de la propriété accueillant le flux secondaire</label>
  <input type="text" name="primaryFlowFKNameInput" ref="primaryFlowFKNameInput" value={data.specificData.primaryFlowFKName}></input>

  <script>

    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }
    this.updateData = function (dataToUpdate) {
      this.innerData = dataToUpdate;
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
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });
  </script>
</join-by-field-editor>
