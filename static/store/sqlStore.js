
function sqlStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.on('connectesql', function(data) {
    console.log('connectesql in ajax |', data);
    console.log(this.genericStore.itemCurrent._id.$oid)
    $.ajax({
      method: 'post',
      url: '../data/specific/sqlconnecte/' + this.genericStore.itemCurrent._id.$oid,
      // processData: false,
      data: data,
      // contentType : 'application/json',
    }).done(function(data) {
      console.log("sql connected", data)
      this.trigger('connectesqltrue');
    }.bind(this));
  });


  this.on('validateModel', function(data) {
    console.log('validateModel in ajax |', data);
    $.ajax({
      method: 'post',
      url: '../data/specific/createmodel/'  + this.genericStore.itemCurrent._id.$oid,
      // processData: false,
      data: data,
      // contentType : 'application/json',
    }).done(function(data) {
      console.log("validateModel", data);
      this.trigger('connectesqltrue');
    }.bind(this));
  });

    this.on('request', function(data) {
    console.log('request in ajax |', data);
    $.ajax({
      method: 'post',
      url: '../data/specific/request/'  + this.genericStore.itemCurrent._id.$oid,
      // processData: false,
      data: data,
      // contentType : 'application/json',
    }).done(function(data) {
      console.log("request", data);
      this.trigger('connectesqltrue');
    }.bind(this));
  });
}