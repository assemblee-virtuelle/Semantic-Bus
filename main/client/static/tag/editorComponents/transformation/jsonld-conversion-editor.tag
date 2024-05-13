<jsonld-conversion-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-JsonLdConversion" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <jsonEditor ref="configObjectInput" title="frame context" style="flex:1" modes="['tree','text']"></jsonEditor>


  <script>
    this.updateData=function(dataToUpdate){
      this.data=dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.configObject=this.data.specificData.configObject||"{}";
      this.refs.configObjectInput.data = this.data.specificData.configObject;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
      this.refs.configObjectInput.on('change',function(e){
        this.data.specificData.configObject=this.refs.configObjectInput.data;
      }.bind(this));
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });
  </script>
</jsonld-conversion-editor>
