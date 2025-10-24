<array-split-by-condition-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-ArraySplitByCondition" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <jsonEditor ref="conditionObjectInput" title="Condition Schema" style="flex:1" modes="['tree','text']"></jsonEditor>

  <script>
    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.conditionString=this.data.specificData.conditionString||"{}";
      this.refs.conditionObjectInput.data = JSON.parse(this.data.specificData.conditionString);
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.refs.conditionObjectInput.on('change',function(e){
        this.data.specificData.conditionString=JSON.stringify(this.refs.conditionObjectInput.data);
      }.bind(this));
      RiotControl.on('item_current_changed',this.updateData);
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</array-split-by-condition-editor>

