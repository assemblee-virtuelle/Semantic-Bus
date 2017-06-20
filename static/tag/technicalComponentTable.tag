<technical-component-table class="containerV">
    <zenTable style="flex:1" title="Composant technique" disallowcommand="true" disallownavigation="true">
      <yield to="header">
        <div>type</div>
        <div>description</div>
      </yield>
      <yield to="row">
        <div style="width:30%">{type}</div>
        <div style="width:70%">{description}</div>
      </yield>
    </zenTable>

 <script>



    this.on('mount', function () {
      //console.log(this.tags);
     this.tags.zentable.on('rowSelect',function(data){
       //console.log(data);
       RiotControl.trigger('technicalComponent_current_select',data);
     }.bind(this));
     this.tags.zentable.on('addRow',function(){
       //console.log(data);
       RiotControl.trigger('technicalComponent_current_init');
     }.bind(this));

     this.tags.zentable.on('delRow',function(data){
       //console.log(data);
       RiotControl.trigger('technicalComponent_delete',data);

     }.bind(this));

     RiotControl.on('technicalComponent_collection_changed',function(data){
       //console.log('view',data);
       this.tags.zentable.data=data;
     }.bind(this));

     RiotControl.trigger('technicalComponent_collection_load');

     //this.refresh();

   });
  </script>
  <style>

  </style>
</technical-component-table>
