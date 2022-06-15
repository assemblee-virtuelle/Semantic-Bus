<js-evaluation-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-JsEvaluation" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
 <!-- Multi line text area -->
  <label class="labelFormStandard">Code JavaScript à faire appliquer aux données:</label>
  <div class="cardInput">
    <textarea class="inputComponents" name="pathInput" value={data.specificData.jsString} onChange={pathInputChange} rows="4" cols="50">
    </textarea>
  </div>

<script>
  this.updateData=function(dataToUpdate){
    this.data=dataToUpdate;
    this.update();
  }.bind(this);

  this.pathInputChange=function(e){
    this.data.specificData.jsString=e.target.value;
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });
</script>

</js-evaluation-editor>
