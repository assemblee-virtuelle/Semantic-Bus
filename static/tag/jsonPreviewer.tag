<jsonPreviewer class="containerV">
  <jsonEditor ref="jsonPreviewer" mode="text" style="flex:1"></jsonEditor>
  <script>
    this.on('mount', function () {
      RiotControl.on('previewJSON',function(jsonPreviewData){
        console.log('preview',jsonPreviewData);
        this.refs.jsonPreviewer.data=jsonPreviewData;
      }.bind(this));
    }.bind(this));
  </script>
  <style>
  </style>
</jsonPreviewer>
