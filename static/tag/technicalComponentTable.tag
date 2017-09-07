<technical-component-table class="containerV">
  <div class="commandBar containerH">
    <div>add Component</div>
    <div class="containerH commandGroup">
      <!--<div onclick={cancelClick} class="commandButton">
        cancel
      </div>-->
      <div if={actionReady} onclick={addComponent} class="commandButton notSynchronized">
        add
      </div>
    </div>
  </div>
    <zenTable style="flex:1"  disallowcommand={true} disallownavigation={true}>
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

    this.actionReady=false;
    addComponent(e) {
      this.tags.zentable.data.forEach(record=>{
        if(record.selected){
          RiotControl.trigger('workspace_current_add_component',record);
        }

      });
    }

    this.on('mount', function () {
      //console.log(this.tags);
    //  this.tags.zentable.on('action',function(data){
    //    //console.log(data);
    //    data.forEach(record=>{
    //      RiotControl.trigger('technicalComponent_current_select',record);
    //    });
     //
    //  }.bind(this));
     this.tags.zentable.on('rowSelect',function(){

        this.actionReady=true;
        this.update();
     }.bind(this));
     this.tags.zentable.on('addRow',function(){
       //console.log(data);
       RiotControl.trigger('technicalComponent_current_init');
     }.bind(this));

     this.tags.zentable.on('delRow',function(data){
       //console.log(data);
       RiotControl.trigger('technicalComponent_delete',data);

     }.bind(this));
     this.tags.zentable.on('cancel',function(data){
       //console.log(data);
       RiotControl.trigger('workspace_current_add_component_cancel');

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
