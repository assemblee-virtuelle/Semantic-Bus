<filter-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Filter" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Filter</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">Filtrer le flux</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  <jsonEditor ref="filterObjectInput" title="Filter Schema" style="flex:1" modes="['tree','text']"></jsonEditor>

  <script>
    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.filterString=this.data.specificData.filterString||"{}";
      this.refs.filterObjectInput.data = JSON.parse(this.data.specificData.filterString);
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.refs.filterObjectInput.on('change',function(e){
        this.data.specificData.filterString=JSON.stringify(this.refs.filterObjectInput.data);
      }.bind(this));
      RiotControl.on('item_current_changed',this.updateData);
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</filter-editor>
