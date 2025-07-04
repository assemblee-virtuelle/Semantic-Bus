<sparql-request-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-SPARQL" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <label class="labelFormStandard">Description de la requête SPARQL</label>
  <div>
    <textArea class="textArea" type="text" ref="requeteInput" style="flex-grow:1" onchange={requeteInputChanged}>{data.specificData.request}</textArea>
  </div>
  <script>

    this.data={};
    this.test=function(){
      consol.log('test');
    }
    this.updateData=function(dataToUpdate){
      this.data=dataToUpdate;
      this.update();
    }.bind(this);

    requeteInputChanged(e){
      this.data.specificData.request=e.target.value;
    }

    /*
    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.data=data;
         this.update();
       }.bind(this),
       get: function () {
        return this.data;
      },
      configurable: true
    });
    */
    this.on('mount', function () {
      // this.requeteInput.addEventListener('change',function(e){
      //   this.data.specificData.request=e.currentTarget.value;
      // }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</sparql-request-editor>
