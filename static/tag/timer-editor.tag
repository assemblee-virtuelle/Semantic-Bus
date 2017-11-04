<timer-editor>


  <div>execute flow each interval</div>
  <label>interval (minutes)</label>
  <input type="text" id="intervalInput" onChange={changeIntervalInput} ref="keyInput" value={data.specificData?data.specificData.interval: null }></input>
  <label>last execution</label>
  <div>{data.specificData?data.specificData.last: null }</div>


  <script>

    this.data = {};

    changeIntervalInput(e){
      console.log('change',this.data.specificData,e);
      this.data.specificData.interval=e.target.value;
    }

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
</timer-editor>
