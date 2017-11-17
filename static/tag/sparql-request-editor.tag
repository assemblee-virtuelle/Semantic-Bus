<sparql-request-editor class="containerV">
  <div>
    <div>description de la requete SPARQL</div>
    <label>requete</label>
  </div>
  <div class="containerV">
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
