<slice-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-slice" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <!-- Customisation du composant ci-dessous -->

 <!--  Index de début du slice -->
  <label class="labelFormStandard">Index de début :</label>
  <div class="cardInput">
    <input class="inputComponents" type="number" ref="startIndex" value={data.specificData.startIndex} placeholder="0" onchange={startIndexChange}/>
  </div>
  <!--  Index de fin du slice  -->
  <label class="labelFormStandard">Index de fin :</label>
  <div class="cardInput">
    <input class="inputComponents" type="number" ref="endIndex" value={data.specificData.endIndex} placeholder="15" onchange={endIndexChange}/>
  </div>

<script>
    endIndexChange = e => {
      this.data.specificData.endIndex = e.currentTarget.value;
    };

    startIndexChange = e => {
      this.data.specificData.startIndex = e.currentTarget.value;
    };

  this.updateData=function(dataToUpdate){
    this.data=dataToUpdate;
    console.log('here')
    this.update();
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });
</script>

</slice-editor>
