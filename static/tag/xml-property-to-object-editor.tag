<xml-property-to-object-editor>
  <div>propriété xml à transformer en onjet</div>
  <label>propriété</label>
  <input type="text" name="propertyToConvert" value={data.specificData.propertyToConvert}></input>
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
      this.propertyToConvert.addEventListener('change',function(e){
        this.innerData.specificData.propertyToConvert=e.currentTarget.value;
      }.bind(this));

      RiotControl.on('item_current_changed',function(data){
        this.innerData=data;

        this.update();
      }.bind(this));
    });

  </script>
</xml-property-to-object-editor>
