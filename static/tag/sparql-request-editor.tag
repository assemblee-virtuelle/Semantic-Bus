<sparql-request-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
<div class="contenaireV title-component">SPARQL REQUEST</div>
<!-- Description du composant -->
<label style="padding-top: 10px;">Requêter en SPARQL sur un fichier json ld</label>
<!-- Champ du composant -->
  <div>
    <div style="padding-top: 10px;">Description de la requête SPARQL</div>
  </div>
  <div class="containerV" style="width:90%">
    <textArea type="text" ref="requeteInput" style="flex-grow:1" onchange={requeteInputChanged}>{data.specificData.request}</textArea>
  </div>
  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
    }
    this.updateData=function(dataToUpdate){
      this.innerData=dataToUpdate;
      this.update();
    }.bind(this);

    requeteInputChanged(e){
      this.data.specificData.request=e.target.value;
    }


    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData=data;
         this.update();
       }.bind(this),
       get: function () {
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function () {
      // this.requeteInput.addEventListener('change',function(e){
      //   this.innerData.specificData.request=e.currentTarget.value;
      // }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</sparql-request-editor>
