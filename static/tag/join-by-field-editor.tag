<join-by-field-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">JOINTURE PAR CHAMP</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Completer un flux par un second en se basant sur un champ du 1er et un identifiant du 2nd</label>
  <label style="padding-top: 10px;">Jointure entre un flux principal et un flux secondaire</label>
  <!-- Champ du composant -->
  <label style="padding-top: 10px;">Composant qui contient le flux principal</label>
  <select style="width:600px;"name="primaryComponentIdInput" ref="primaryComponentIdInput">
    <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.data.specificData.primaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label style="padding-top: 10px;">Champ du composant principal qui contient l'identifiant du flux secondaire</label>
  <input class="field" style="width:600px;"type="text" name="primaryFlowFKIdInput" value={data.specificData.primaryFlowFKId} ref="primaryFlowFKIdInput"></input>
  <label style="padding-top: 10px;">Composant qui contient le flux secondaire</label>
  <select style="width:600px;"name="secondaryComponentIdInput" ref="secondaryComponentIdInput">
    <option each={option in linkedComponents.beforeComponents} value={option._id} selected={parent.data.specificData.secondaryComponentId ==option._id}>{option.type} : {option.name}</option>
  </select>
  <label style="padding-top: 10px;">Champ du composant secondaire qui défini son identifiant</label>
  <input class="field" style="width:600px;"type="text" name="secondaryFlowIdInput" ref="secondaryFlowIdInput" value={data.specificData.secondaryFlowId}></input>
  <label style="padding-top: 10px;">Nom de la propriété accueillant le flux secondaire</label>
  <input class="field" style="width:600px;"type="text" name="primaryFlowFKNameInput" ref="primaryFlowFKNameInput" value={data.specificData.primaryFlowFKName}></input>

  <script>

    this.innerData = {};
    this.test = function () {
      consol.log('test');
    }
    this.updateData = function (dataToUpdate) {
      this.innerData = dataToUpdate;
      this.update();
      RiotControl.trigger('component_current_connections_refresh');
    }.bind(this);

    this.updateConnections = function (connections) {
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
