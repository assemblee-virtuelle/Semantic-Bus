function UtilStore (specificStoreList) {
  riot.observable(this) // Riot provides our event emitter.

  this.ajaxCall = function (param, persistTrigger) {
    return new Promise((resolve, reject) => {
      // console.log('UtilStore | ajaxCall');
      if (persistTrigger) {
        this.trigger('persist_start')
      }
      param.headers = {
        'Authorization': 'JTW' + ' ' + localStorage.token
      }
      param.contentType = 'application/json'

      $.ajax(param).done(function (data) {
        if (persistTrigger) {
          this.trigger('persist_end')
        }
        resolve(data)
      }.bind(this)).fail(function (error) {
        if (persistTrigger) {
          this.trigger('persist_end')
        }
        if (error.status === 500) {
          this.trigger('persist_end')
          this.trigger('ajax_fail', 'Désolé nous rencontrons une erreur Interne')
        }
        if (error.status === 403) {
          this.trigger('ajax_fail', 'Vous n\'avez pas les droit suffisant pour réaliser cette action')
          this.trigger('persist_end')
          window.location = '/ihm/application.html#myWorkspaces'
        }
        if (error.status === 400) {
          this.trigger('ajax_fail', error.responseJSON.message)
          this.trigger('persist_end')
        }
        if (error.status === 401) {
          window.location = '/ihm/login.html'
          localStorage.clear()
        }
        reject(error)
      }.bind(this))
    })
  }

  this.objectSetFieldValue = function (object, field, value) {
    let fieldArray = field.split('.')
    let currentObject = object
    for (var i = 0; i < fieldArray.length - 1; i++) {
      currentObject = currentObject[fieldArray[i]]
    }
    currentObject[fieldArray[fieldArray.length - 1]] = value
  }
}
