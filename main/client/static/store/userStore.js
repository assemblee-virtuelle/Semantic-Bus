function UserStore (utilStore) {
  riot.observable(this)
  this.utilStore = utilStore

  this.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  this.on('user_inscription', function (user) {
    this.utilStore.ajaxCall({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/data/auth/inscription'
    }).then(data => {
      if (data != null && data.token != null) {
        localStorage.token = data.token
        this.trigger('application_redirect')
      }
    })
  })

  this.on('user_connect', function (user) {
    this.utilStore.ajaxCall({
      method: 'post',
      data: JSON.stringify(user),
      contentType: 'application/json',
      url: '/data/auth/authenticate',
    }).then(data => {
      if (data != null && data.token != null) {
        localStorage.token = data.token
        this.trigger('application_redirect')
      }
    })
  })

  this.on('google_connect', function (token) {
    var tokenObject = { token }
    this.utilStore.ajaxCall({
      method: 'post',
      data: JSON.stringify(tokenObject),
      contentType: 'application/json',
      url: '/data/auth/google_auth_statefull_verification'
    }).then(data => {
      if (data && data.token != null) {
        localStorage.token = data.token
        this.trigger('application_redirect')
      }
    })
  })

  this.on('updatePassword', function (data) {
    this.utilStore.ajaxCall({
      method: 'get',
      contentType: 'application/json',
      data: JSON.stringify(data),
      url: '/data/auth/secure?mail=' + window.location.hash.split('mail=')[1]
    }).then(data => {
      this.trigger('ajax_sucess', 'Votre mot de passe a été mis à jour')
      window.location = '/ihm/login.html#connexion'
    })
  })

  this.on('google_user_connect', function () {
    this.utilStore.ajaxCall({
      method: 'get',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      contentType: 'text/html',
      url: '/data/auth/google'
    }).then(data => {
      sleep(2000).then(function () {
        this.trigger('ajax_receipt_login', '/connexion')
      }.bind(this))
    })
  })

  this.on('forgot_password', function (email) {
    this.utilStore.ajaxCall({
      method: 'get',
      contentType: 'application/json',
      url: '/data/auth/passwordforget?mail=' + email
    }).then(() => {
      this.trigger('ajax_sucess', 'Un mail vous a était envoyé merci de verifier votre boite mail')
      window.location = '/ihm/login.html#connexion'
    })
  })
}
