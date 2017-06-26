<scrapper-editor>
  <div>Information à propos du scrappeur</div>
  <label>url</label>
  <input type="text" name="url" value={data.specificData.url}></input>
  <label>chemin (2 attributs minimum)</label>
  <input type="text" name="chemin" value={data.specificData.chemin}></input>
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
    this.on('mount', function () {
      this.url.addEventListener('change',function(e){
        this.innerData.specificData.url = e.currentTarget.value;
      }.bind(this));

      this.chemin.addEventListener('change',function(e){
        this.innerData.specificData.chemin = e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',function(data){
        this.innerData=data;
        this.update();
      }.bind(this));
    });
  </script>
</scrapper-editor>
