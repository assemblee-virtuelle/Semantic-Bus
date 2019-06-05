<jsonpreviewer class="containerV">
  <div class="containerH info">
    <div class="containerV">
      <label>Nom du composant:</label>
      <input type="text" readonly="true" value={data.componentName}></input>
    </div>
    <div class="containerV">
      <label>Date début:</label>
      <input type="text" readonly="true" value={new Date(data.startTime).toLocaleDateString()}></input>
    </div>
    <div class="containerV">
      <label>Heure début:</label>
      <input type="text" readonly="true" value={new Date(data.startTime).toLocaleTimeString()}></input>
    </div>
    <div class="containerV">
      <label>Module:</label>
      <input type="text" readonly="true" value={data.componentModule}></input>
    </div>
  </div>
  <div class="containerH info">
    <div class="containerV">
      <label>Durée (ms):</label>
      <input type="text" readonly="true" value={(new Date(data.timeStamp)-new Date(data.startTime))}></input>
    </div>
    <div class="containerV">
      <label>Nombre de record:</label>
      <input type="text" readonly="true" value={data.recordCount}></input>
    </div>
    <div class="containerV">
      <label>Nombre d'octet:</label>
      <input type="text" readonly="true" value={data.moCount}></input>
    </div>
    <div class="containerV">
      <label>Prix en crédit:</label>
      <input type="text" readonly="true" value={data.totalPrice}></input>
    </div>
  </div>
    <jsonfragviewer show={data.persistProcess||data.error} ref="jsonFragViewer" style="flex-grow:100;"></jsonfragviewer>

  <script>
    this.data = {};
    this.updateData = function (data) {
      // console.log('COMPONENT PREVIEW', data);
      this.data = data;
      this.update();
      if (this.refs.jsonFragViewer) {
        if (data.error != undefined) {
          this.refs.jsonFragViewer.data = data.error;
        } else {
          this.refs.jsonFragViewer.data = data.data;
        }
      }

      this.update();
    }.bind(this);

    this.updatePersistData = function (data) {
      this.refs.jsonFragViewer.data = data;
    }.bind(this);

    this.refreshFrag = function (data, nodeId) {
      // console.log('refreshFrag',data, nodeId);
      this.refs.jsonFragViewer.refreshNode(data, nodeId);
    }.bind(this);

    this.on('mount', function () {
      if (this.refs.jsonFragViewer) {
        this.refs.jsonFragViewer.on('open_frag_node', (fragId, nodeId) => {
          //console.log('OPEN', fragId, nodeId);
          RiotControl.trigger("cache_frag_load", fragId, nodeId)
        })
      }
      RiotControl.on('previewJSON', this.updateData);
      RiotControl.on('cache_frag_loaded', this.refreshFrag);
      RiotControl.on('item_current_process_persist_changed', this.updatePersistData);
      RiotControl.trigger('previewJSON_refresh');
    });
    this.on('unmount', function () {
      RiotControl.off('previewJSON', this.updateData);
      RiotControl.off('cache_frag_loaded', this.refreshFrag);
      RiotControl.off('item_current_process_persist_changed', this.updatePersistData);
    });
  </script>
  <style>

    .info {
      flex-shrink: 0;
      flex-wrap: wrap;
      justify-content: space-around;
    }
    .info > div {
      padding: 5px;
      border-style: solid;
      border-color: rgb(213, 218, 224);
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
</jsonpreviewer>
