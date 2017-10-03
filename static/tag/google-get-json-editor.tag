<google-get-json-editor>
  <div>information de connection à google calc</div>
  <label>key</label>
  <input type="text" id="keyInput" ref="keyInput" value={data.specificData.key}></input>
  <label>select</label>
  <input type="text" id="selectInput" ref="selectInput" value={data.specificData.select}></input>
  <label>offset</label>
  <input type="text" id="offsetInput" ref="offsetInput" value={data.specificData.offset}></input>
  <script>

    this.data={};
    this.data.specificData = {}
    //
    // Object.defineProperty(this, 'data', {
    //    set: function (data) {
    //      this.innerData=data;
    //      this.update();
    //    }.bind(this),
    //    get: function () {
    //     //console.log('getInnerData |',this.innerData);
    //     return this.innerData;
    //   },
    //   configurable: true
    // });

    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {

      this.refs.keyInput.addEventListener('change',function(e){
        console.log('keychange',this.data);
        this.data.specificData.key = e.currentTarget.value;
      }.bind(this));

      this.refs.selectInput.addEventListener('change',function(e){
        this.data.specificData.select= e.currentTarget.value;
      }.bind(this));
      this.refs.offsetInput.addEventListener('change',function(e){
        this.data.specificData.offset = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });


  </script>
</google-get-json-editor>
