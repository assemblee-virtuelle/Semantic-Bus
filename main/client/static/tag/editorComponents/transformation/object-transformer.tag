<object-transformer>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Transform" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <div class="containerH" style="justify-content:space-between">
    <div class="options">
      <label class="labelFormStandard">détail des évaluations:</label>
      <div class="cardInput">
        <label class="switch">
            <input type="checkbox" name="evaluationDetailValueInput" ref="evaluationDetailValueInput" checked={data.specificData.evaluationDetail} onchange={evaluationDetailChange}/>
            <span class="slider round"></span>
        </label>
      </div>
    </div>
  </div>
  <jsoneditor ref="jsonSchema" title="Transform Schema" class="containerV" modes="['tree','text']"></jsoneditor>
  <script>
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.data.specificData = this.data.specificData || {};
      this.data.specificData.transformObject = this.data.specificData.transformObject || {};
      this.refs.jsonSchema.data = this.data.specificData.transformObject;
      this.update();
    }.bind(this);

    evaluationDetailChange(event){
      console.log('evaluationDetailChange',event);
        this.data.specificData.evaluationDetail = event.target.checked
    }

    this.on('mount', function () {
      this.refs.jsonSchema.on('change', function (e) {
        this.data.specificData.transformObject = this.refs.jsonSchema.data;
      }.bind(this));
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>

  <style scoped="scoped">


  </style>
</object-transformer>
