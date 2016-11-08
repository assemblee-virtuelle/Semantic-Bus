<jsonTransformer class="containerV">
 <h3>{opts.title}</h3>
 <jsonEditor name="jsonSchema" title="Transform Schema" style="flex:1"></jsonEditor>
 <script>

   this.on('mount', function () {
   }.bind(this));

   Object.defineProperty(this, "data", {
      set: function (data) {
        this.tags.jsonSchema.data=data;
      },
      get: function () {
       return   this.tags.jsonSchema.data;
      }
   });

   /*RiotControl.on('previewJSON',function(jsonPreviewData){
     //console.log('flowIn',jsonPreviewData);
      if(jsonPreviewData.blockId==1){
        //console.log('flowIn',jsonPreviewData.data);
        this.flowIn=jsonPreviewData.data;
      }

    test(){
           var sendedData={
             data:this.flowIn,
             template:this.data
           };
           console.log(sendedData);

           $.ajax({
             url: "/data/transform/",
             type: 'get',
             data:sendedData,
             timeout: 2000
           }).done(function(datas) {
             console.log(datas, JSON.stringify(datas))
             RiotControl.trigger('previewJSON',{blockId:2,direction:'push',data:datas})

             //console.log(opt);
             //this.tags.jsoneditor[1].jsonData=datas;
             //$('#response').jsonEditor(datas, opt);
             //$('#raw').val(JSON.stringify(datas,null,4));
           }.bind(this)).fail(function(err) {
             $('#error').text(JSON.stringify(err));
           });
    }

    //transformButton.addEventListener('click',this.transform);
    //console.log(RiotControl);
  }.bind(this));*/


  </script>
  <style>

  </style>

</jsonTransformer>
