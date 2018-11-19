<user-list class="containerV" style="justify-content:center;">
<div class="containerH" style="justify-content:center;">
  <!-- partager votre WorkFlow à un utilisateur -->
  <div class="containerU box" style="justify-content:center;height: 600px">

      <div class="containerU" style="justify-content: center; align-items: center;">
        <p class="text-user-list">Saisissez une adresse e-mail pour partager votre Workflow</p>
        <input id="users-list" class="awesomplete" placeholder="Entrez une adresse email..." value="{email}">

        <p style="color:red">{resultShare}</p>
        <!-- Bouton Valider -->
        <div class="containerV" style="justify-content: center; align-items: center;">
          <button class="btn" onclick={shareClick} type="button">Valider</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    this.resultShare = ""
    this.actionReady = false;
    this.email = "";
    this.data = {};

    this.shareClick = function (e) {
      console.log("user component share", this.workspace)
      //if (this.workspace) {
      RiotControl.trigger('share-workspace');
      //};
    }
    // this.share = function(){     console.log("user component share",this.workspace)     if (this.workspace) {       RiotControl.trigger('share-workspace', {         email: this.email,         worksapce_id: this.workspace._id       });     };
    // }.bind(this) cancelClick(e) {   RiotControl.trigger('workspace_current_add_user_cancel');   this.actionReady=false; }

    this.allProfilByEmailLoad = function (data) {
      var input = document.getElementById("users-list");
      var awesomplete = new Awesomplete(input);
      awesomplete.list = data;
      input.addEventListener('awesomplete-selectcomplete', function (evt) {
        this.actionReady = true;
        this.email = evt.target.value;
        RiotControl.trigger('set-email-to-share', this.email)
        this.update();
      }.bind(this));
    }.bind(this);

    this.workspaceCurrentChanged = function (data) {
      this.workspace = data
    }.bind(this);

    this.shareChanged = function (data) {
      console.log("share change")
      this.resultShare = "Votre workspace a été partagé";
      this.update();

      //data = null;

    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('share_change_no_valide', function () {
        this.resultShare = "Aucun utilisateur trouvé";
        this.update();
      }.bind(this))

      RiotControl.on('share_change_already', function () {
        this.resultShare = "Workspace déjà partagé";
        this.update();
      }.bind(this))

      RiotControl.on('share_change', this.shareChanged);

      RiotControl.on('share_change_send', function () {
        this.resultShare = "Envoie en cour";
        this.update();
      }.bind(this));

      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.on('all_profil_by_email_load', this.allProfilByEmailLoad);
      //RiotControl.on("store_share_workspace",this.share);
      RiotControl.trigger('load_all_profil_by_email');
      RiotControl.trigger('workspace_current_refresh');
    })
    this.on('unmount', function () {
      //RiotControl.off("store_share_workspace",this.share);
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.off('all_profil_by_email_load', this.allProfilByEmailLoad);
      RiotControl.off('share_change', this.shareChanged);
    })
  </script>
  <style scoped="scoped">

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
    /*couleur du text partager workflow*/
    .text-user-list {
      color: grey;
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
      background: rgb(238,242,249)!important;
      border: none!important;
      box-shadow: none!important;
      text-shadow: none;
    }

    .awesomplete mark {
      color: rgb(9,245,185);
      background: rgb(238,242,249);
      border: 1px solid rgb(238,242,249);
      border-radius: 5px;
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
      background-color: #ffffff;
      background-image: linear-gradient(#fff, #f2f3f5);
      border-radius: 35px;
      border-width: 1px;
      border-style: solid;
      border-color: rgb(213,218,224);
      width: 400px;
      height: 35px;
    }

    .notSynchronized {
      opacity:1 color: white;
    }

    buttonBusNotAvailable {
      margin-left: -1px;
      height: 38px;
      padding-left: 19pt;
      border-radius: 15pt;
      border: 3px solid white;
      color: white;
      padding-right: 19pt;
      opacity: 0.3;
    }
  </style>
</user-list>
