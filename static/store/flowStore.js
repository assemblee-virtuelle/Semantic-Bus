// TodoStore definition.
// Flux stores house application logic and state that relate to a specific domain.
// In this case, a list of todo items.
function FlowStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.googleLinearFlowCollection =[];
  this.googleLinearFlowCurrent =[];

  this.load=function(){
    //console.log('load GLF');
    $.ajax({
      method:'get',
      url:'../data/core/flow'
    }).done(function(data){
      console.log('store load',data);
      this.googleLinearFlowCollection=data;
      this.trigger('GLF_collection_changed',this.googleLinearFlowCollection);
    }.bind(this));
  };

  this.create=function(){
    $.ajax({
      method:'post',
      url:'http://localhost:3000/data/core/flow',
      data:JSON.stringify(this.googleLinearFlowCurrent),
      contentType : 'application/json'
    }).done(function(data){
      this.googleLinearFlowCurrent.mode='edit';
      this.load();
    }.bind(this));
  };

  this.update=function(){
    $.ajax({
      method:'put',
      url:'http://localhost:3000/data/core/flow',
      data:JSON.stringify(this.googleLinearFlowCurrent),
      contentType : 'application/json'
    }).done(function(data){
      this.load();
      this.googleLinearFlowCurrent.mode='edit';
    }.bind(this));
  };

  this.delete =function(record){
    $.ajax({
      method:'delete',
      url:'http://localhost:3000/data/core/flow',
      data:JSON.stringify(record),
      contentType : 'application/json'
    }).done(function(data){
      this.load();
    }.bind(this));
  };

  this.on('GLF_delete',function(record){
    this.delete(record);
  });

  this.on('GLF_collection_load',function(record){
    this.load();
  });

  this.on('GLF_current_updateField',function(message){
    console.log(message.data);
    this.googleLinearFlowCurrent[message.field]=message.data;
    console.log(this.googleLinearFlowCurrent);
    this.trigger('GLF_current_changed',this.googleLinearFlowCurrent);
  });

  this.on('GLF_current_edit',function(data){
    console.log('store edit',data);
    this.googleLinearFlowCurrent=data;
    this.googleLinearFlowCurrent.mode='edit';
    this.trigger('GLF_current_changed',this.googleLinearFlowCurrent);
  });

  this.on('GLF_current_init',function(){
    this.googleLinearFlowCurrent={
      source:{type: 'googleSpreadSheet'},
      transformer:{entities:["$..",{}]},
      destination: {type: 'HttpApi'}
    };
    this.googleLinearFlowCurrent.mode='init';
    this.trigger('GLF_current_changed',this.googleLinearFlowCurrent);
  });

  this.on('GLF_current_perist',function(message){
    this.googleLinearFlowCurrent.selected=undefined;
    this.googleLinearFlowCurrent.mainSelected=undefined;
    var mode = this.googleLinearFlowCurrent.mode;
    this.googleLinearFlowCurrent.mode=undefined;
    if(mode=='init'){
      this.create();
    }else if (mode=='edit') {
      this.update();
    }
  });

  this.on('GLF_currrent_testSource',function(){
    $.ajax({
      url: "/data/googleSpreadseetQuery/",
      type: 'get',
      data:  this.googleLinearFlowCurrent.source,
      timeout: 5000
    }).done(function(data) {
      //console.log(datas, JSON.stringify(datas))
      RiotControl.trigger('previewJSON',data)
    }.bind(this)).fail(function(err) {
      //$('#error').text(JSON.stringify(err));
    });
  }.bind(this));

  this.on('GLF_currrent_testApi',function(){
    console.log('test api');
    $.ajax({
      url: "/data/query/"+this.googleLinearFlowCurrent.destination.url,
      type: 'get',
      timeout: 5000
    }).done(function(data) {
      //console.log(data, JSON.stringify(data))
      RiotControl.trigger('previewJSON',data)
    }.bind(this)).fail(function(err) {

    });
  }.bind(this));

/*
  this.todos = [
    { title: 'Task 1', done: false },
    { title: 'Task 2', done: false }
  ]

  this.on('todo_add', function(newTodo) {
    this.todos.push(newTodo)
    this.trigger('todos_changed', self.todos)
  }.bind(this))

  this.on('todo_remove', function() {
    this.todos.pop()
    this.trigger('todos_changed', self.todos)
  }.bind(this))

  this.on('todo_init', function() {
    this.trigger('todos_changed', self.todos)
  }.bind(this))
*/
  // The store emits change events to any listening views, so that they may react and redraw themselves.

}
