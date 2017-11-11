<user-list>
    <div  class="headerComponent">
        <div class="containerH commandBar"> 
          <div></div>
          <div>Ajouter un utilisateur</div>
          <div  onclick={share} class="{buttonBusNotAvailable:!actionReady} {buttonBus:actionReady} {notSynchronized:actionReady}">
            share
          </div>
        </div>
    </div>
    <div class="containerV" style="height: 85%;background-color:rgb(238,242,249);justify-content: center;
    align-items: center;">
      <input id="users-list" class="awesomplete champ"  placeholder="entrez un email..." value="{email}">
      <!--<a class="share-btn" onclick={share}>Partager</a>-->
      <p class="text-user-list">{resultShare}</p>
      <p class="text-user-list">Saisissez une adresse e-mail pour partager votre Workspace</p>
    </div>
  <script>
    this.resultShare = ""
    this.actionReady=false;

    RiotControl.on('share_change_no_valide', function () {
      this.resultShare = "Aucun utilisateur trouvé";
      this.update();
    }.bind(this))

    RiotControl.on('share_change_already', function () {
      this.resultShare = "Workspace déjà partagé";
      this.update();
    }.bind(this))

    RiotControl.on('share_change', function (data) {
      this.resultShare = "Votre workspace a été partagé";
      this.update();
      data = null;
    }.bind(this))

    RiotControl.on('share_change_send', function () {
      this.resultShare = "Envoie en cour";
      this.update();
    }.bind(this));

    RiotControl.on('workspace_current_changed', function (data) {
      //console.log('load current worksapce : user module ||', data)
      this.workspace = data
    }.bind(this));

    RiotControl.on('all_profil_by_email_load', function (data) {
      console.log("all_profil_by_email_load")
      var input = document.getElementById("users-list");
      var awesomplete = new Awesomplete(input);
      awesomplete.list = data;
      input.addEventListener('awesomplete-selectcomplete', function (evt) {
        this.actionReady=true;
        this.email = evt.target.value;
        this.update();
      }.bind(this));
    }.bind(this));

    share(e) {
      if (this.workspace) {
        RiotControl.trigger('share-workspace', {
          email: this.email,
          worksapce_id: this.workspace._id
        });
      }
    }
    cancelClick(e) {
      RiotControl.trigger('workspace_current_add_user_cancel');
      this.actionReady=false;
    }

    this.on('mount', function () {
      this.email = "";
// console.log($('#users-list'));
// $('#users-list').on('change', function (e) {
//   console.log('value changed',e);
//   this.email = e.currentTarget.value;
// }.bind(this));
      RiotControl.trigger('load_all_profil_by_email');


      RiotControl.trigger('workspace_current_refresh');
    })
  </script>
  <style scoped>

    .share-btn {
      color: white;
      background-color: #3883fa;
      border: none;
      padding: 10px;
      border-radius: 5px 5px 5px 5px;
      text-align: center;
      max-width: 25%;
      margin-top: 10vh;
      margin-left: 39%;
    }
    .text-user-list {
      margin-top: 20vh;
      color: rgb(200,200,200);
    }
    .flex-container {
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .title-user-list {
      text-align: center;
      width: 100%;
      background-color: #3883fa;
      color: white;
      padding: 5vh;
    }
    .ui-menu .ui-menu-item a {
      color: rgb(238,242,249);
      border-radius: 5px;
      text-align: center;
      margin-left: 5%;
      margin-top: 100px;
      padding: 10px !important;
    }

    .awesomplete > ul > li {
      position: relative;
      padding: 20px;
      cursor: pointer;
    }

    .awesomplete > ul {
      border-radius: 0.3em;
      background: white!important;
      border: none!important;
      box-shadow: none!important;
      text-shadow: none;
    }

    .awesomplete mark {
      color:rgb(9,245,185);
      background: rgb(238,242,249);;
      border:1px solid rgb(238,242,249);
      border-radius:5px
    }
    mark {
      background: #3883fa;
      color: white;
    }

    .awesomplete > ul {
      position: absolute;
      left: 0;
      z-index: 1;
      min-width: 100%;
      box-sizing: border-box;
      list-style: none;
      padding: 0;
      background: #fff;
      text-align: center;
    }

    .awesomplete {
      display: inline!important;
      position: relative;
    }


    .notSynchronized {
      opacity:1
      color: white;
    }

    buttonBusNotAvailable {
      margin-left: -1px;
      height: 38px;
      padding-left: 19pt;
      border-radius: 15pt;
      border: 3px solid white;
      color: white;
      padding-right: 19pt;
      opacity:0.3
    }

  </style>
</user-list>
