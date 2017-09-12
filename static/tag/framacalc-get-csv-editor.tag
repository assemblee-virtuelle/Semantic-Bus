<framacalc-get-csv-editor>
  <div>information de connection à framacalc</div>
  <label>key</label>
  <input type="text" name="keyInput" value={data.specificData.key}></input>
  <label>offset</label>
  <input type="text" name="offsetInput" value={data.specificData.offset}></input>
  <script>

    this.innerData={};
    this.test=function(){
      console.log('test');
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
      this.keyInput.addEventListener('change',function(e){
        this.innerData.specificData.key=e.currentTarget.value;
      }.bind(this));


      this.offsetInput.addEventListener('change',function(e){
        this.innerData.specificData.offset=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</framacalc-get-csv-editor>
