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
         if(data.specificData){
          this.tags.jsonSchema.data= data.specificData.transformObject;
          data.specificData
         }
         this.update();
       }.bind(this),
       get: function () {
        //TODO add listerner to jsonEditor
        if(this.innerData.specificData){
          this.innerData.specificData.transformObject = this.tags.jsonSchema.data;
          return this.innerData;
        }else{
          this.innerData.specificData = {}
          this.innerData.specificData.transformObject = this.tags.jsonSchema.data;
          return this.innerData;
        }
      },
      configurable: true
    });
    this.on('mount', function () {
      RiotControl.on('item_current_changed',function(data){
        console.log('item_current_changed OBJECT TRANSFORMER', data)
        this.data=data;
      }.bind(this));
    });

  </script>
</object-transformer>
