<jsonPreviewer class="containerV">
  <div class="commandBar containerH" style="height: 100pt;
    /* text-align: center; */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(33,150,243);
    color:white">
  <div>Result flow</div>
  </div>
  <jsonEditor ref="jsonPreviewer" mode="text" style="flex:1;"></jsonEditor>
  <script>
    this.updateData=function(jsonPreviewData){
      this.refs.jsonPreviewer.data=jsonPreviewData;
    }.bind(this);
    this.on('mount', function () {
      RiotControl.on('previewJSON',this.updateData);
      RiotControl.trigger('previewJSON_refresh');
    });
    this.on('unmount', function () {
      RiotControl.off('previewJSON',this.updateData);
    });
  </script>
  <style>
  </style>
</jsonPreviewer>
