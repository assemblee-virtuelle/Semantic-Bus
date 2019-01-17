function UploadStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.on('item_current_upload', function(data) {
    console.log('item_current_upload in ajax |', data);
    $.ajax({
      method: 'post',
      url: '../data/specific/upload/' + this.genericStore.itemCurrent._id,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      // processData: false,
      data: data,
      // contentType : 'application/json',
      processData: false,
      contentType: false,
      xhr: function() {
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {
              if (evt.lengthComputable) {
                // calcule du pourcentage de l'upload
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);
                // console.log("pourcent xhr |", percentComplete)
                this.trigger('loading', percentComplete);
                // changement design bar telechargement
              }
            }.bind(this), false);
            return xhr;
          }.bind(this)
    }).done(function(data) {
      //console.log("data uplaod", data)
      //console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
      this.trigger('item_is_upload');
      route('workspace/' + this.genericStore.workspaceCurrent._id + '/component');
    }.bind(this)).fail(function(error) {
      //console.log("in fail ajax")
      this.trigger('ajax_fail',error.displayMessage||error.message);
    }.bind(this));
  });
}
