<google-get-json-editor>
  <div>information de connection à google calc</div>
  <label>key</label>
  <input type="text" id="keyInput" onChange={changeKeyInput} ref="keyInput" value={data.specificData?data.specificData.key: null }></input>
  <label>select</label>
  <input type="text" id="selectInput" ref="selectInput" onChange={changeSelectInput} value={data.specificData?data.specificData.select: null}></input>
  <label>offset</label>
  <input type="text" id="offsetInput" ref="offsetInput"  onChange={changeOffsetInput} value={data.specificData? data.specificData.offset: null}></input>
  <script>

  //// marche mais à changer je pense
  changeKeyInput(e){
    if(this.data != null && this.data.specificData != null ){
      console.log('keychange',this.data);
      this.data.specificData.key = e.currentTarget.value;
    }else if(this.data.specificData.select == null){
      this.data = {}
      this.data.specificData = {}
      this.data.specificData.url = e.currentTarget.value;
      console.log("else if", this.data.specificData.url)
    }else{
      this.data.specificData.url = e.currentTarget.value;
      console.log("else", this.data.specificData.url)
    }
  };

  changeSelectInput(e){
    if(this.data != null && this.data.specificData != null ){
      this.data.specificData.select= e.currentTarget.value;
    }
  };

  changeOffsetInput(e){
    if(this.data != null && this.data.specificData != null ){
      this.data.specificData.offset = e.currentTarget.value;
    }
  };

  this.updateData=function(dataToUpdate){
    this.data = dataToUpdate;
    this.update();
  }.bind(this);

  this.on('mount', function () {
    RiotControl.on('item_current_changed',this.updateData);
  });
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });


  </script>
</google-get-json-editor>
