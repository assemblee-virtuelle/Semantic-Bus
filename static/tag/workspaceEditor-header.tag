<workspace-editor-header class="containerH" style="flex-wrap:nowrap;flex-grow:1">

  <div class="commandBar containerH" style="flex-grow:1">
    <div></div>
    <div class="containerV">
      <div if={menu=='component' } class="containerH">
        <div>
          modifier votre worflow
        </div>
      </div>
      <div if={menu=='user' } class="containerH">
        <div>
          les utilisateurs qui ont acces au workflow
        </div>
      </div>
      <div if={menu=='information' } class="containerH">
        <div>
          les informations du worflow
        </div>
      </div>
      <div if={menu=='addComponent' } class="containerH">
        <div>
          ajouter un composant au workflow
        </div>
      </div>
      <div if={menu=='share' } class="containerH">
        <div>
          ajouter un utilisateur au workflow
        </div>
      </div>
      <div if={menu=='utilisation' } class="containerH">
        <div>
          consomation du workflow
        </div>
      </div>
      <div if={menu=='process' } class="containerH">
        <div>
          les process
        </div>
      </div>
      <div class="containerH" >
        <div class="main-title">{data.name}</div>
      </div>
    </div>

    <div style="flex-basis:100px;flex-grow:0;flex-shrink:0">
      <div if={menu=='component' } onclick={showAddComponentClick} class="commandButtonImage containerV">
        <img src="./image/ajout_composant.svg" style="" height="40px" width="40px">
        <div style="text-align:center">ajouter un composant</div>
      </div>

      <div if={menu=='user' } onclick={showShareClick} class="commandButtonImage containerV">
        <img src="./image/ajout_composant.svg" style="" height="40px" width="40px">
        <div style="text-align:center">ajouter un utilisateur</div>
      </div>
      <div if={menu=='information' } onclick={persistClick} class="commandButtonImage containerV">
        <img src="./image/Super-Mono-png/PNG/sticker/icons/inbox.png" style="" height="40px" width="40px">
        <div style="text-align:center">valider</div>
      </div>
      <div if={menu=='addComponent' } onclick={addComponentClick} class="commandButtonImage containerV">
        <img src="./image/Super-Mono-png/PNG/sticker/icons/inbox.png" style="" height="40px" width="40px">
        <div style="text-align:center">valider</div>
      </div>
      <div if={menu=='share' } onclick={shareClick} class="commandButtonImage containerV">
        <img src="./image/Share.svg" style="" height="40px" width="40px">
        <div style="text-align:center">partager</div>
      </div>
      <div if={menu=='process' } onclick={shareClick} class="commandButtonImage containerV">
        <img src="./image/Super-Mono-png/PNG/sticker/icons/bin.png" style="" height="40px" width="40px">
        <div style="text-align:center">supprimer tous</div>
      </div>
    </div>

  </div>

  <style></style>
  <script>
    this.data = {};

    this.persistClick = function (e) {
      //console.log("--------- persistClick WORKSPACE TAG ----------------", this.innerData)
      RiotControl.trigger('workspace_current_persist')
    }.bind(this)

    this.showAddComponentClick = function (e) {
      route('workspace/' + this.data._id + '/addComponent');
    }.bind(this)

    this.showShareClick = function (e) {
      route('workspace/' + this.data._id + '/share');
    }.bind(this)

    this.addComponentClick = function(e) {
       //console.log("In navigation")
       RiotControl.trigger("workspace_current_add_components")
    }

    this.shareClick = function(e) {
      console.log("user component share",this.workspace)
      //if (this.workspace) {
        RiotControl.trigger('share-workspace');
      //};
    }

    RiotControl.on('workspace_editor_menu_changed', function (menu) {
      this.menu = menu;
      this.update();
    }.bind(this));

    this.workspaceCurrentChanged = function (data) {
      this.data = data;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged);
      RiotControl.trigger('workspace_current_refresh');
    });

    this.on('unmount', function () {
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged);
      //RiotControl.off('share_change', this.shareChange)
    });
  </script>
</workspace-editor-header>
