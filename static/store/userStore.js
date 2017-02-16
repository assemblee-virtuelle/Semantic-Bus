function UserStore() {
  riot.observable(this) // Riot provides our event emitter.

  this.userCurrrent;

  this.on('user_connect', function(user) {
    $.ajax({
      method: 'get',
      url: '../data/core/user',
      data: JSON.stringify(user),
      contentType: 'application/json'
    }).done(data => {
      console.log(data);
      this.userCurrrent = data;
    }.bind(this));
  });
}
