function UtilStore(specificStoreList) {

  riot.observable(this) // Riot provides our event emitter.

  this.ajaxCall=function(param,persistTrigger){

    return new Promise((resolve,reject)=>{
//console.log('UtilStore | ajaxCall');
      if(persistTrigger){
          this.trigger('persist_start');
      }
      param.headers= {
        "Authorization": "JTW" + " " + localStorage.token
      };
      param.contentType= 'application/json';

      $.ajax(param).done(function(data) {
        if(persistTrigger){
            this.trigger('persist_end');
        }
        resolve(data);
      }.bind(this)).fail(function(error) {
        if(persistTrigger){
            this.trigger('persist_end');
        }
        if(error.status == 500){
          console.log('FAIL');
          this.trigger('ajax_fail',error.responseJSON.displayMessage||error.responseJSON.message);
        }
        reject(error);
      }.bind(this));
    })
  }

}
