<rest-get-editor>
  <div>description du web service à intéroger</div>
  <label>url</label>
  <input type="text" ref="urlInput" onChange={changeUrl} value={data.specificData.url}></input>
  <script>
    this.data = {}
    this.data.specificData = {}
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate
      this.update();
    }.bind(this);
    changeUrl(e){
      this.data.specificData.url = e.currentTarget.value;
    }
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
     }.bind(this));

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</rest-get-editor>
