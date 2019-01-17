<googleSpreadSheetQuerier>
  <h3>Google SpreadSheet Querier</h3>
  <div>
      <div >
        <label>provider</label>
        <input type="text" name="providerInput" value={data.provider} ></input>
        <label>clef google spreadsheet</label>
        <input type="text" name="urlInput" value={data.key}/>
        <label>select</label>
        <input type="text" name="selectInput"  value={data.select}/>
        <label>offset</label>
        <input type="text" name="offsetInput"  value={data.offset}/>
      </div>
      <div name="error"></div>
  </div>

 <script>

 /*this.sheetrockReadyPromise=new Promise(function(resolve, reject) {
   var readyWait=function(){
       setTimeout(function(){
         //console.log(typeof JSONEditor);
         if (typeof sheetrock!='undefined'){
           //console.log('sheetrock READY');
           resolve();
         }else{
           //console.log('sheetrock WAIT');
           readyWait();
         }
       }.bind(this),100);
     }.bind(this);
     readyWait();
   }.bind(this));
*/
   this.on('before-mount', function () {
     /*$.ajax({
       url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery-sheetrock/1.0.1/dist/sheetrock.min.js',
       dataType: 'script',
       }
     ).done(function(){
     });*/
   });

   Object.defineProperty(this, 'data', {
      set: function (data) {
         this.innerData=data;
         this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      }
   });

   /*test(){
     //this.error.textContent='pending';
     var sendedData=this.data;
     console.log(sendedData);

     $.ajax({
       url: "/data/googleSpreadseetQuery/",
       type: 'get',
       data:sendedData,
       timeout: 5000
     }).done(function(data) {
       //console.log(datas, JSON.stringify(datas))
       RiotControl.trigger('previewJSON',data)
     }.bind(this)).fail(function(err) {
       //$('#error').text(JSON.stringify(err));
     });
   }*/

   this.on('mount', function () {
    this.urlInput.addEventListener('change',function(e){
      this.data.key=e.currentTarget.value;
    }.bind(this));
    this.selectInput.addEventListener('change',function(e){
      this.data.select=e.currentTarget.value;
    }.bind(this));
    this.offsetInput.addEventListener('change',function(e){
      this.data.offset=e.currentTarget.value;
    }.bind(this));
    this.providerInput.addEventListener('change',function(e){
      this.data.provider=e.currentTarget.value;
    }.bind(this));
   });

  </script>
  <style>



/*
  .table{
    display:table;
    width: 100%;
  }
  .tableHeader, .tableBody {
    display:table-row;
  }
  .tableHeader>*, .tableBody>*{
    display:table-cell;
    padding: 5px;
  }
  */
  </style>

</googleSpreadSheetQuerier>
