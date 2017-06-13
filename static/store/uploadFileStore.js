function UploadStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.on('item_current_upload', function(data) {
    console.log('item_current_upload', data);
    console.log(data);
    $.ajax({
      method: 'post',
      data: data,
      url: '../data/specific/upload/' + this.genericStore.itemCurrent._id.$oid ,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      processData: false,
      contentType: false,
    }).done(function(data) {
      return data
    }.bind(this));
  });
}
