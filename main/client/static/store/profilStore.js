function ProfilStore (utilStore) {
  riot.observable(this)
  this.utilStore = utilStore
  this.setUserCurrent = function (user) {
    this.userCurrrent = user
  }

  this.on('get_user_from_storage', () => {
    this.trigger('profil_menu_changed', this.menu)
    this.trigger('user_from_storage', this.userCurrrent)
  })

  this.on('load_user_workspace_graph', () => {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/users/me/graph',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(data => {
      this.trigger('profil_menu_changed', this.menu)
      this.trigger('load_user_workspace_graph_done', data.workspaceGraph)
    })
  })

  this.on('send_back_email', function (data) {
    this.utilStore.ajaxCall({
      method: 'post',
      url: '../data/core/users/mail?mail=' + data.user.credentials.email,
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(() => {
      this.trigger('ajax_sucess', `Un mail vous a été envoyé, consultez votre boite mail`)
    })
  })

  this.on('load_all_profil_by_email', function (message) {
    this.utilStore.ajaxCall({
      method: 'get',
      url: '../data/core/users',
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
      var emails = []
      data.forEach(function (user) {
        if (user.credentials) {
          emails.push(user.credentials.email)
        }
      })
      this.trigger('all_profil_by_email_load', emails)
    }.bind(this))
  })

  this.on('update_user', function (data) {
    this.utilStore.ajaxCall({
      method: 'patch',
      url: '../data/core/users/me',
      data: JSON.stringify(data),
      headers: {
        'Authorization': 'JTW' + ' ' + localStorage.token
      },
      contentType: 'application/json'
    }).then(function (data) {
      this.trigger('ajax_sucess', `Votre profil à été mis à jour`)
      this.trigger('user_from_storage', data)
    }.bind(this))
  })

  this.on('navigation', function (entity, id, action) {
    if (entity === 'profil') {
      this.menu = action
      this.trigger('navigation_control_done', entity, action)
    }
  })

  this.on('logout', function (message) {
    localStorage.clear();
    window.open('../ihm/login.html', '_self')
  })

  // this.on('profil_upload_certificate', function (data) {
  //   $.ajax({
  //     method: 'post',
  //     url: '../data/core/users/me/certificates',
  //     headers: {
  //       'Authorization': 'JTW' + ' ' + localStorage.token
  //     },
  //     // processData: false,
  //     data: data,
  //     // contentType : 'application/json',
  //     processData: false,
  //     contentType: false,
  //     xhr: function () {
  //       var xhr = new XMLHttpRequest()
  //       xhr.upload.addEventListener('progress', function (evt) {
  //         if (evt.lengthComputable) {
  //           // calcule du pourcentage de l'upload
  //           var percentComplete = evt.loaded / evt.total
  //           percentComplete = parseInt(percentComplete * 100)
  //           // console.log("pourcent xhr |", percentComplete)
  //           this.trigger('loading', percentComplete)
  //           // changement design bar telechargement
  //         }
  //       }.bind(this), false)
  //       return xhr
  //     }.bind(this)
  //   }).done(function (data) {
  //     this.trigger('certificate_uploaded')
  //     getCertificates(this.utilStore).then(certificates => {
  //       this.trigger('profil_certificates_changed',certificates);
  //     }).catch(e=>{

  //     });

  //   }.bind(this)).fail(function (error) {
  //     console.error('UPLOAD FAILED')
  //     //console.log("in fail ajax");
  //     console.error(error);
  //     this.trigger('ajax_fail', error.responseJSON?.message)
  //   }.bind(this))
  // })

  // this.on('profil_get_certificates', async function () {
  //   const certificates = await getCertificates(this.utilStore);
  //   this.trigger('profil_certificates_changed',certificates);
  // })

  // this.on('profil_remove_certificate', function (data) {
  //   // console.log('profil_remove_certificate',data)
  //   $.ajax({
  //     method: 'delete',
  //     url: `../data/core/users/me/certificates/${data}`,
  //     headers: {
  //       'Authorization': 'JTW' + ' ' + localStorage.token
  //     },
  //     // processData: false,
  //     // data: data,
  //     // contentType : 'application/json',
  //     processData: false,
  //     contentType: false,
  //   }).done(function (data) {
  //     this.trigger('certificate_deleted',data)
  //     getCertificates(this.utilStore).then(certificates => {
  //       this.trigger('profil_certificates_changed',certificates);
  //     }).catch(e=>{

  //     });

  //   }.bind(this)).fail(function (error) {
  //     console.error('UPLOAD FAILED')
  //     //console.log("in fail ajax");
  //     console.error(error);
  //     this.trigger('ajax_fail', error.responseJSON?.message)
  //   }.bind(this))
  // })
  
  // async function getCertificates(utilStore) {
  //   const certificates = await utilStore.ajaxCall({
  //     method: 'get',
  //     url: '../data/core/users/me/certificates',
  //     // data: JSON.stringify(data),
  //     headers: {
  //       'Authorization': 'JTW' + ' ' + localStorage.token
  //     },
  //     contentType: 'application/json'
  //   });
  //   return certificates
  // }
}
