<googleLinearFlowTable class="containerV">
    <zenTable style="flex:1" >
      <yield to="header">
        <div>provider</div>
        <div>source</div>
        <div>destination</div>
      </yield>
      <yield to="row">
        <div style="width:50%">{source.provider}</div>
        <div style="width:25%">{source.type}</div>
        <div style="width:25%">{destination.type}</div>
      </yield>
    </zenTable>

 <script>

    /*refresh(){
      $.ajax({
        method:'get',
        url:'../data/core/flow'
      }).done(function(data){
        console.log(data);
        this.tags.zentable.data=data;
      }.bind(this));
    }*/

    this.on('mount', function () {
     this.tags.zentable.on('rowSelect',function(data){
       //console.log(data);
       RiotControl.trigger('GLF_current_edit',data);
     }.bind(this));
     this.tags.zentable.on('addRow',function(){
       //console.log(data);
       RiotControl.trigger('GLF_current_init');
     }.bind(this));

     this.tags.zentable.on('delRow',function(data){
       // console.log(data);
       RiotControl.trigger('GLF_delete',data);
       /*$.ajax({
         method:'delete',this.tags.zentable.data=data;
         url:'http://localhost:3000/data/core/flow',
         data:JSON.stringify(data),
         contentType : 'application/json'
       }).done(function(data){
         RiotControl.trigger('blocAdd',{blockType:'googleLinearFlow',data:data});
       }.bind(this));*/
     }.bind(this));

     /*RiotControl.on('blocUpdate',function(message){
       this.refresh();
     }.bind(this));

     RiotControl.on('blocAdd',function(message){
       this.refresh();
     }.bind(this));*/

     RiotControl.on('GLF_collection_changed',function(data){
       console.log('view',data);
       this.tags.zentable.data=data;
     }.bind(this));

     RiotControl.trigger('GLF_collection_load');

     //this.refresh();

   });
  </script>
  <style>

  </style>
</googleLinearFlowTable>
