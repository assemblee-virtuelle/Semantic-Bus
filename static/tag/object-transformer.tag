<object-transformer>
  <div>configuration d'un objet de transformation</div>
  <jsonEditor ref="jsonSchema" title="Transform Schema" class="containerV" modes="['tree','text']"></jsonEditor>
  <script>
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.transformObject=this.data.specificData.transformObject||{};
      this.refs.jsonSchema.data = this.data.specificData.transformObject;
      this.update();
    }.bind(this);
    this.on('mount', function () {
      this.refs.jsonSchema.on('change',function(e){
        this.data.specificData.transformObject=this.refs.jsonSchema.data;
      }.bind(this));
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</object-transformer>
