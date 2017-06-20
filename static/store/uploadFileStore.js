function UploadStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.on('item_current_upload', function(data) {
    // console.log('item_current_upload |', data);
    $.ajax({
      method: 'post',
      // data: data,
      url: '../data/specific/upload/' + this.genericStore.itemCurrent._id.$oid ,
      headers: {
        "Authorization": "JTW" + " " + localStorage.token
      },
      // processData: false,
      data:data,
      contentType : 'application/json',
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
      this.trigger('item_is_upload');
    }.bind(this));
  });
}
