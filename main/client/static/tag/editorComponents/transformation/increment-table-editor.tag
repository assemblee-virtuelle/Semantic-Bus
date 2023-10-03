<increment-table-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-incrementTable" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <!--  Index de début du slice -->
  <label class="labelFormStandard">Index de début :</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="startIndex" value={data.specificData.startIndex} placeholder="0" onchange={startIndexChange}/>
  </div>
  <!--  Index de fin du slice  -->
  <label class="labelFormStandard">Index de fin :</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="endIndex" value={data.specificData.endIndex} placeholder="15" onchange={endIndexChange}/>
  </div>
  <!--  Range  -->
  <label class="labelFormStandard">Pas d'itération :</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="range" value={data.specificData.range} placeholder="1" onchange={rangeChange}/>
  </div>

<script>
  endIndexChange = e => {
    this.data.specificData.endIndex = e.currentTarget.value;
  };

  startIndexChange = e => {
    this.data.specificData.startIndex = e.currentTarget.value;
  };

  rangeChange = e => {
    this.data.specificData.range = e.currentTarget.value;
  };

  this.updateData=function(dataToUpdate){
    this.data=dataToUpdate;
    this.update();
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });
</script>

</increment-table-editor>
