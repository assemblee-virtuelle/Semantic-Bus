<httpApi>
  <h3>HTTP API</h3>
  <div >
    <div><input type="text" name="urlOutPut" value={data.url}/></div>
  </div>

 <script>
   Object.defineProperty(this, 'data', {
      set: function (data) {
         this.innerData=data;
         this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      }
   });

   test(){
     //this.error.textContent='pending';
     //var sendedData=this.data;
     //console.log('test api');
/*
     $.ajax({
       url: "/data/query/"+this.data.url,
       type: 'get',
       timeout: 5000
     }).done(function(data) {
       //console.log(data, JSON.stringify(data))
       RiotControl.trigger('previewJSON',data)
     }.bind(this)).fail(function(err) {

     });*/
   }

   this.on('mount', function () {
     this.urlOutPut.addEventListener('change',function(e){
       console.log(this);
       this.data.url=e.currentTarget.value;
     }.bind(this));
   });

  </script>
  <style>
  .inlineBlockDisplay{
    display: inline-block;
    vertical-align: top;
  }
  </style>

</httpApi>
