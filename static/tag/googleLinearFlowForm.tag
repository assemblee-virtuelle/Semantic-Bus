<googleLinearFlowForm style="flex:1" class="containerV">
  <div class="containerH commandBar">
    <div class="commandButton" name="saveButton" show={data.mode!=undefined}>save</div>
    <div class="commandButton" name="newButton">+</div>
  </div>
  <div style="flex:1" class="containerV" show={data.mode!=undefined}>
    <!--<div style="height:2000px"></div>-->
    <div class="containerH" >
      <googleSpreadSheetQuerier name="googleSSQuerier" style="flex:1"></googleSpreadSheetQuerier>
      <div style="flex-basis:40px">
        <button name="testQuerier" class="testButton">test</button>
      </div>
    </div>
    <div class="containerH" style="flex-basis:400px">
      <jsonTransformer name="jsonSchema" title="Transform Schema" style="flex:1"></jsonTransformer>
      <!--<button name="testTransformer" class="testButton">test</button>-->
      <!--<div style="flex-basis:40px">
      </div>-->
    </div>
    <div class="containerH">
      <geoTransformer name="geoTransformer" style="flex:1"></geoTransformer>
    </div>
    <div class="containerH" >
      <httpApi name="httpApi" title="sortie" style="flex:1"></httpApi>
      <div style="flex-basis:40px">
        <button name="testAPI" class="testButton">test</button>
      </div>
    </div>
  </div>

 <script>
   this.innerData={};

   Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData=data;
        this.update();
        this.tags.googleSSQuerier.data= data.source;
        this.tags.jsonSchema.data=data.transformer;
        this.tags.httpApi.data=data.destination;
        console.log('Y ', data);
        this.tags.geoTransformer.data=data.geoTransformer;
        //this.update();

      }.bind(this),
      get: function () {
       return this.innerData;
      }
   });
   this.on('mount', function () {
     this.tags.geoTransformer.on('adressChange',function(data){
       console.log('form notification');
       RiotControl.trigger('GLF_current_updateField',{field:'geoTransformer',data:data});
     }.bind(this));
   });

   this.testQuerier.addEventListener('click',function(e){
     //console.log('clic');
     //this.tags.googleSSQuerier.test();
     RiotControl.trigger('GLF_currrent_testSource');
   }.bind(this));



   this.testAPI.addEventListener('click',function(e){
     //console.log('clic');
     //this.tags.httpApi.test();
     RiotControl.trigger('GLF_currrent_testApi');
   }.bind(this));

/*
   RiotControl.on('blocSelect',function(message){
     this.RiotControl.trigger('GLF_current_edit',message.data);
     this.mode='edit'
     this.data=message.data;
   }.bind(this));*/

   /*RiotControl.on('addBloc',function(message){
     this.RiotControl.trigger('GLF_current_init');
     //console.log(message);
     //this.mode='add';
     //this.data={source:{type: 'googleSpreadSheet'},transformer:{entities:["$..",{}]},destination: {type: 'HttpApi'}};
   }.bind(this));*/


   this.saveButton.addEventListener('click',function(e){
     RiotControl.trigger('GLF_current_updateField',{field:'transformer',data:this.tags.jsonSchema.data});
     RiotControl.trigger('GLF_current_updateField',{field:'source',data:this.tags.googleSSQuerier.data});
     RiotControl.trigger('GLF_current_updateField',{field:'destination',data:this.tags.httpApi.data});
     //console.log(this.tags.geoTransformer.data);
     RiotControl.trigger('GLF_current_perist');
   }.bind(this));

   this.newButton.addEventListener('click',function(e){
     RiotControl.trigger('GLF_current_init');
   }.bind(this));

   RiotControl.on('GLF_current_changed',function(data){
     //console.log('view edit',data);
     this.data=data;
   }.bind(this));

  </script>
  <style>
  .testButton{
    height:100%;
  }

  </style>
</googleLinearFlowForm>
