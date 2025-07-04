<object-transformer>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Transform" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data?.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data?.description}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <div if={data?.specificData} class="containerH" style="justify-content:space-evenly">
    <!--  <div class="options">
      <label class="labelFormStandard">détail des évaluations:</label>
      <div class="cardInput">
        <label class="switch">
            <input type="checkbox" name="evaluationDetailValueInput" ref="evaluationDetailValueInput" checked={data.specificData.evaluationDetail} onchange={evaluationDetailChange}/>
            <span class="slider round"></span>
        </label>
      </div>
    </div>  -->
    <div class="options">
      <label class="labelFormStandard">conserver les champs de la source:</label>
      <div class="cardInput">
        <label class="switch">
            <input type="checkbox" name="keepSourceValueInput" ref="keepSourceValueInput" checked={data.specificData.keepSource} onchange={keepSourceChange}/>
            <span class="slider round"></span>
        </label>
      </div>
    </div>
    <!--  <div class="options">
      <label class="labelFormStandard">version du transformer:</label>
      <div class="cardInput">
        <select name="version" ref="versionInput" onchange={versionChange}>
          <option value="default" selected={data.specificData.version==='default' || data.specificData.version===undefined}>default</option>
          <option value="v1" selected={data.specificData.version==='v1'}>V1</option>
          <option value="v2" selected={data.specificData.version==='v2'}>V2</option>
        </select>
      </div>
    </div>  -->
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
        this.data.specificData.evaluationDetail = event.target.checked
    }

    keepSourceChange(event){
        this.data.specificData.keepSource = event.target.checked
    }

    versionChange(event){
      console.log( event.target.value);
        this.data.specificData.version = event.target.value
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
