<query-params-creation-editor style="justify-content:center; align-items: center;">
<!-- Titre du composant -->
<div class="contenaireV title-component">QueryParamsCreation</div>
<!-- Description du composant -->
<label style="padding-top: 10px;">Créer des paramètres de requête dand le flux</label>
<!-- Champ du composant -->
  <div style="padding-top: 10px;">Configuration de la création de paramètre de query</div>
  <jsonEditor style="width: 90%;"ref="jsonSchema" title="Transform Schema" class="containerV" modes="['tree','text']"></jsonEditor>
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
