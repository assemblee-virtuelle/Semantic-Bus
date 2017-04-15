<filter-editor>
  <div>description de l'api</div>
  <label>filtre</label>
  <input type="text" name="filterStringInput" value={data.specificData.filterString}></input>
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
    this.on('mount', function () {
      this.filterStringInput.addEventListener('change',function(e){
        this.innerData.specificData.filterString=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',function(data){
        this.data=data;
      }.bind(this));
    });

  </script>
</filter-editor>
