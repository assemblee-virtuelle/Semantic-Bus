<rest-get-editor>
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
        if(this.innerData.specificData != null){
          console.log("in if")
          this.innerData.specificData.url=e.currentTarget.value;
        }else{
          console.log("in else")
          this.innerData.specificData = {}
          this.innerData.specificData.url = "init"
          console.log(this.innerData.specificData.url)
          this.innerData.specificData.url = e.currentTarget.value;
        }
         console.log("COMPONENT CHANGE URL", this.innerData.specificData)
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</rest-get-editor>
