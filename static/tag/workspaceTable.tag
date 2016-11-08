<workspace-table class="containerV">
    <zenTable style="flex:1" title="Workspace">
      <yield to="header">
        <div>nom</div>
        <div>description</div>
      </yield>
      <yield to="row">
        <div style="width:30%">{name}</div>
        <div style="width:70%">{description}</div>
      </yield>
    </zenTable>

 <script>
    //console.log('mount opts :',this.opts);

    this.refreshZenTable=function(data){
      console.log('view',data);
      this.tags.zentable.data=data;
    }.bind(this);

    this.on('unmount', function () {
      RiotControl.off('workspace_collection_changed',this.refreshZenTable);
    });

    this.on('mount', function (args) {
      //console.log('mount argr :',opts);
     this.tags.zentable.on('rowSelect',function(data){
       console.log(data);
       RiotControl.trigger('workspace_current_select',data);
       this.trigger('selectWorkspace');
     }.bind(this));

     this.tags.zentable.on('addRow',function(){
       //console.log(data);

       RiotControl.trigger('workspace_current_init');
       this.trigger('newWorkspace');
     }.bind(this));

     this.tags.zentable.on('delRow',function(data){
       RiotControl.trigger('workspace_delete',data);

     }.bind(this));

     RiotControl.on('workspace_collection_changed',this.refreshZenTable);

     RiotControl.trigger('workspace_collection_load');

     //this.refresh();

   });
  </script>
  <style>

  </style>
</workspace-table>
