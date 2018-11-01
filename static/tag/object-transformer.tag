<object-transformer>
  <!-- Titre du composant -->
  <div class="contenaireV title-component"> OBJECT TRANSFORMER</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Transformer un objet par mapping grâce à un objet transformation</label>
  <label style="padding-top: 10px;">Ce composant est capable de transformer la structure des données. Il se paramètre grâce à un objet de transformation qui décrit comment transformer la structure.</label>

<!-- Champ du composant -->
  <div>Configuration d'un objet de transformation</div>
  <jsonEditor ref="jsonSchema" title="Transform Schema" class="containerH" style="" modes="['tree','text']"></jsonEditor>
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
