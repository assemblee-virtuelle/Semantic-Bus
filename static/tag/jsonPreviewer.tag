<jsonPreviewer class="containerV">
  <jsonEditor ref="jsonPreviewer" mode="text" style="flex:1"></jsonEditor>
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
