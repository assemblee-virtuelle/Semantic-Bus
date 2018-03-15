<query-params-creation-editor>
  <div>configuration de la creation de parametre de query</div>
  <jsonEditor ref="jsonSchema" title="Transform Schema" class="containerV" modes="['tree','text']"></jsonEditor>
  <script>
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.queryParamsCreationObject=this.data.specificData.queryParamsCreationObject||{};
      this.refs.jsonSchema.data = this.data.specificData.queryParamsCreationObject;
      this.update();
    }.bind(this);
    this.on('mount', function () {
      this.refs.jsonSchema.on('change',function(e){
        this.data.specificData.queryParamsCreationObject=this.refs.jsonSchema.data;
      }.bind(this));
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</query-params-creation-editor>
