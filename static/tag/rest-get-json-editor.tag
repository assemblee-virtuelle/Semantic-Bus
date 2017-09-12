<rest-get-json-editor>
  <div>description du web service à intéroger</div>
  <label>url</label>
  <input type="text" name="urlInput" value={data.specificData.url}></input>
  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
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
    this.updateData=function(dataToUpdate){
      this.innerData=dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.urlInput.addEventListener('change',function(e){
        this.innerData.specificData.url=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</rest-get-json-editor>
