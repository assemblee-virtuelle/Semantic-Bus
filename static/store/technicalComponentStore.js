function TechnicalComponentStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.technicalComponentCollection =[];
  this.technicalComponentCurrent =[];

  this.load=function(){
    //console.log('load GLF');
    $.ajax({
      method:'get',
      url:'../data/core/technicalComponent',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
    }).done(function(data){
      //console.log('store load',data);
      this.technicalComponentCollection=data;
      this.trigger('technicalComponent_collection_changed',this.technicalComponentCollection);
    }.bind(this));
  };

  this.create=function(){
    $.ajax({
      method:'post',
      url:'../data/core/technicalComponent',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      data:JSON.stringify(this.technicalComponentCurrent),
      contentType : 'application/json'
    }).done(function(data){
      this.technicalComponentCurrent.mode='edit';
      this.load();
    }.bind(this));
  };

  this.update=function(){
    $.ajax({
      method:'put',
      url:'../data/core/technicalComponent',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      data:JSON.stringify(this.technicalComponentCurrent),
      contentType : 'application/json'
    }).done(function(data){
      this.load();
      this.technicalComponentCurrent.mode='edit';
    }.bind(this));
  };

  this.delete =function(record){
    $.ajax({
      method:'delete',
      url:'../data/core/flow',
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      data:JSON.stringify(record),
      contentType : 'application/json'
    }).done(function(data){
      this.load();
    }.bind(this));
  };

  this.on('technicalComponent_delete',function(record){
    this.delete(record);
  });

  this.on('technicalComponent_collection_load',function(record){
    this.load();
  });

  this.on('technicalComponent_current_updateField',function(message){
    console.log(message.data);
    this.technicalComponentCurrent[message.field]=message.data;
    console.log(this.technicalComponentCurrent);
    this.trigger('technicalComponent_current_changed',this.technicalComponentCurrent);
  });

  // this.on('technicalComponent_current_select',function(data){
  //   console.log('store select');
  //   this.technicalComponentCurrent=data;
  //   this.technicalComponentCurrent.mode='read';
  //   this.trigger('technicalComponent_current_changed',this.technicalComponentCurrent);
  // });

  this.on('technicalComponent_current_edit',function(data){
    console.log('store edit',data);
    this.technicalComponentCurrent=data;
    this.technicalComponentCurrent.mode='edit';
    this.trigger('technicalComponent_current_changed',this.technicalComponentCurrent);
  });

  this.on('technicalComponent_current_init',function(){
    this.technicalComponentCurrent={
      name:"",
      description:""
    };
    this.technicalComponentCurrent.mode='init';
    this.trigger('technicalComponent_current_changed',this.technicalComponentCurrent);
  });

  this.on('technicalComponent_current_persist',function(message){
    this.technicalComponentCurrent.selected=undefined;
    this.technicalComponentCurrent.mainSelected=undefined;
    var mode = this.technicalComponentCurrent.mode;
    this.technicalComponentCurrent.mode=undefined;
    if(mode=='init'){
      this.create();
    }else if (mode=='edit') {
      this.update();
    }
  });

}
