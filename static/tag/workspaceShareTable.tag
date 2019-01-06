<workspace-share-table class="containerV" style="flex-grow:1">
  <div class="containerH" style="height:80px;justify-content: center; align-items: center;flex-shrink:0;">
    <input class="searchbox" type="text" name="inputSearch" ref="inputSearch" placeholder="Rechercher"
           onkeyup={filterCards}/>
  </div>

  <zentable show={!isEmpty} drag={false} disallowselect={true} style="background-color: rgb(238,242,249);">
    <yield to="header">
      <div class="table-title" style="margin-left: 50px;width: 200px;flex-grow:1">Nom</div>
      <div class="table-title" style="margin-right: 60px;width: 500px;flex-grow:1">Description</div>
    </yield>
    <yield to="row">
      <div style="flex-grow:1;width: 200px;">{name}</div>
      <div style="flex-grow:1;width: 500px; word-break: normal;">{description}</div>
    </yield>
  </zentable>
  <div if={isEmpty} class="containerH" style="flex-grow:1;justify-content:center;">
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">
      <h1 style="text-align: center;color: rgb(119,119,119);">
        Vous n'avez pas de Workflow partagé.
      </h1>
    </div>
  </div>

  <script>
    this.data = []
    this.isEmpty = true
    this.filter = ''

    this.refreshData = (data) => {
      this.data = data
      this.reload()
    }

    this.reload = () => {
      const filteredData = this.filteredData()
      this.tags.zentable.data = filteredData
      this.isEmpty = filteredData.length === 0
      this.update()
    }

    this.filteredData = () => {
      if (this.filter === undefined || this.filter === null || this.filter === '') {
        return this.data
      } else {
        return sift(
          { name: { $regex: new RegExp(this.filter, 'gi') } },
          this.data
        )
      }
    }

    this.on('mount', () => {
      this.refs.inputSearch.addEventListener('input', (event) => {
        this.filter = event.target.value
        this.reload()
      })

      this.tags.zentable.on('rowNavigation', (data) => {
        route('workspace/' + data._id + '/component')
      })

      RiotControl.on('workspace_share_collection_changed', this.refreshData)

      RiotControl.trigger('workspace_collection_share_load')
    })

    this.on('unmount', () => {
      RiotControl.off('workspace_share_collection_changed', this.refreshData)
    })
  </script>
  <style>
    .searchbox {
      background-color: #ffffff;
      background-image: linear-gradient(#fff, #f2f3f5);
      border-radius: 35px;
      border-width: 1px;
      border-style: solid;
      border-color: rgb(213,218,224);
      width: 300px;
      height: 35px;
    }
  </style>
</workspace-share-table>
