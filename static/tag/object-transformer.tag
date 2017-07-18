<object-transformer>
  <div>configuration d'un objet de trasformation</div>
  <jsonEditor name="jsonSchema" title="Transform Schema" style="flex:1" modes="['tree','text']"></jsonEditor>
  <script>
    this.innerData={};
    this.test=function(){
      consol.log('test');
    }
    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData=data;
         /*var transformObject = data.transformObject;
         if (transformObject==undefined){
           transformObject={};
         }*/
         this.tags.jsonSchema.data= data.specificData.transformObject;
         this.update();
       }.bind(this),
       get: function () {
        //TODO add listerner to jsonEditor
        this.innerData.specificData.transformObject = this.tags.jsonSchema.data;
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function () {
      /*this.urlInput.addEventListener('change',function(e){
        this.innerData.url=e.currentTarget.value;
      }.bind(this));*/

      RiotControl.on('item_current_changed',function(data){
        this.data=data;
      }.bind(this));
    });

  </script>
</object-transformer>
