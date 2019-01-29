<workspace-zen-table class="containerV" style="flex-grow:1">
  <div class="containerH" style="height:80px;justify-content: center; align-items: center;flex-shrink:0;">
    <input class="searchbox" type="text" name="inputSearch" ref="inputSearch" placeholder="Rechercher vos workspaces..."
           oninput={updateSearch}
    />
  </div>

  <zenTable show={filteredData.length > 0} drag={false} disallowselect={true} ref="zentable" disallowdelete={opts.disallowdelete}>
    <yield to="header">
      <div class="table-title" style="margin-left: 50px;width: 200px;flex-grow:1">Nom</div>
      <div class="table-title" style="margin-right: 60px;width: 500px;flex-grow:1">Description</div>
    </yield>
    <yield to="row">
      <div style="flex-grow:1;width: 200px;">{name}</div>
      <div style="flex-grow:1;width: 500px; word-break: normal;">{description}</div>
    </yield>
  </zenTable>

  <div if={filteredData.length === 0} class="containerH" style="flex-grow:1;justify-content:center;">
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">
      <h1 style="text-align: center;color: rgb(119,119,119);">
        { opts.emptyText }
      </h1>
    </div>
  </div>

  <script>
    this.filter = ''
    this.filteredData = []

    this.reload = () => {
      this.filteredData = this.filterData(this.opts.data)
      this.refs.zentable.data = this.filteredData
    }

    this.filterData = (data) => {
      if (this.filter === undefined || this.filter === null || this.filter === '') {
        return data
      } else {
        return sift(
          { name: { $regex: new RegExp(this.filter, 'i') } },
          data
        )
      }
    }

    this.updateSearch = (event) => {
      this.filter = event.target.value
      this.reload()
    }

    this.on('mount', () => {
      this.reload()
      this.tags.zentable.on('rowNavigation', (data) => route('workspace/' + data._id + '/component'))
      this.tags.zentable.on('delRow', (data) => this.trigger('deleteRow', data))

      this.update()
    })

    this.on('update', () => {
      this.reload()
    })
  </script>

  <style>
    .searchbox {
      background-color: #ffffff;
      background-image: linear-gradient(#fff, #f2f3f5);
      border-width: 1px;
      border-style: solid;
      border-color: rgb(213, 218, 224);
      width: 600px;
      height: 35px;
    }
  </style>
</workspace-zen-table>
