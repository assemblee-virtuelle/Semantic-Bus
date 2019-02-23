<query-params-creation-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Params-creation" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Params creation</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">Créer des paramètres de requête dans le flux.</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  <label class="labelFormStandard">Configuration de la création de paramètre de query:</label>
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
