<workspace-editor-header style="flex-grow:1">

  <page-header
    main-title="{data.name}"
    sub-title="{pages[menu].title}"
    actions={ pages[menu].actions }
  ></page-header>

  <script>
    this.data = {};
    /**
     * @typedef {{title: string, actions: {icon: string, label: string, action: (function())}[]}} PageConfig
     * @type {{component: PageConfig, user: PageConfig, information: PageConfig, addComponent: PageConfig, share: PageConfig, utilisation: PageConfig, process: PageConfig}}
     */
    this.pages = {
      component: {
        title: 'modifier votre worflow',
        actions: [
          { icon: 'ajout_composant', label: 'ajouter un composant', action: () => this.showAddComponentClick() },
          { icon: 'download', label: 'exporter', action: () => this.exportWorkflow() }
        ]
      },
      user: {
        title: 'les utilisateurs qui ont acces au workflow',
        actions: [{ icon: 'ajout_composant', label: 'ajouter un utilisateur', action: () => this.showShareClick() }]
      },
      information: {
        title: 'les informations du worflow',
        actions: [{ icon: 'inbox', label: 'valider', action: () => this.persistClick() }]
      },
      addComponent: {
        title: 'ajouter un composant au workflow',
        actions: [{ icon: 'inbox', label: 'valider', action: () => this.addComponentClick() }]
      },
      share: {
        title: 'ajouter un utilisateur au workflow',
        actions: [{ icon: 'share', label: 'partager', action: () => this.shareClick() }]
      },
      utilisation: {
        title: 'consomation du workflow',
        actions: []
      },
      process: {
        title: 'les process',
        actions: []
      }
    }

    this.persistClick = () => RiotControl.trigger('workspace_current_persist')

    this.showAddComponentClick = () => route('workspace/' + this.data._id + '/addComponent')

    this.exportWorkflow = () => {
      // Server is set to force the download so the user actually does not change location
      window.location.href = '/data/core/workspace/' + this.data._id + '/export?token=JTW ' + localStorage.token
    }

    this.showShareClick = () => route('workspace/' + this.data._id + '/share')

    this.addComponentClick = () => RiotControl.trigger("workspace_current_add_components")

    this.shareClick = () => {
      console.log("user component share",this.workspace)
      RiotControl.trigger('share-workspace')
    }

    RiotControl.on('workspace_editor_menu_changed', (menu) => {
      this.menu = menu
      this.update()
    })

    this.workspaceCurrentChanged = (data) => {
      this.data = data
      this.update()
    }

    this.on('mount', () => {
      RiotControl.on('workspace_current_changed', this.workspaceCurrentChanged)
      RiotControl.trigger('workspace_current_refresh')
    })

    this.on('unmount', () => {
      RiotControl.off('workspace_current_changed', this.workspaceCurrentChanged)
    })
  </script>
</workspace-editor-header>
