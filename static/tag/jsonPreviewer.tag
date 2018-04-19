<jsonPreviewer class="containerV">
  <div class="containerH info" style="flex-wrap:wrap;justify-content:space-around">
    <div class="containerV">
      <label>Nom du composant</label>
      <input type="text" readonly="true" value={data.componentName}></input>
    </div>
    <div class="containerV">
      <label>Date debut</label>
      <input type="text" readonly="true" value={new Date(data.startTime).toLocaleDateString()}></input>
    </div>
    <div class="containerV">
      <label>Heure debut</label>
      <input type="text" readonly="true" value={new Date(data.startTime).toLocaleTimeString()}></input>
    </div>
    <div class="containerV">
      <label>Module</label>
      <input type="text" readonly="true" value={data.componentModule}></input>
    </div>
  </div>
  <div class="containerH info" style="flex-wrap:wrap;justify-content:space-around">
    <div class="containerV">
      <label>Duree (ms)</label>
      <input type="text" readonly="true" value={(new Date(data.timeStamp)-new Date(data.startTime))}></input>
    </div>
    <div class="containerV">
      <label>Nombre de record</label>
      <input type="text" readonly="true" value={data.recordCount}></input>
    </div>
    <div class="containerV">
      <label>Nombre d'octet</label>
      <input type="text" readonly="true" value={data.moCount*1000}></input>
    </div>
    <div class="containerV">
      <label>Prix en credit</label>
      <input type="text" readonly="true" value={data.totalPrice*1000}></input>
    </div>
  </div>
  <jsonEditor ref="jsonPreviewer" mode="view" style="flex:1;"></jsonEditor>
  <script>
    this.data = {};
    this.updateData = function (data) {
      console.log('COMPONENT PREVIEW', data);
      this.data = data;
      if (data.error != undefined) {
        this.refs.jsonPreviewer.data = data.error;
      } else {
        this.refs.jsonPreviewer.data = data.data;
      }

      this.update();
    }.bind(this);
    this.on('mount', function () {
      RiotControl.on('previewJSON', this.updateData);
      RiotControl.trigger('previewJSON_refresh');
    });
    this.on('unmount', function () {
      RiotControl.off('previewJSON', this.updateData);
    });
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
</jsonPreviewer>
