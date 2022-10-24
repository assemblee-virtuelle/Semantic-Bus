<workspace-share-table class="containerV" style="flex-grow:1">
  <workspace-zen-table
    data={data}
    empty-text={"Vous n'avez pas de Workflow partagé."}
    ref="table"
    disallowdelete={true}
  />

  <script>
    this.data = []

    this.refreshData = (data) => {
      this.data = data.map(d=>({
        directNavigationUrl:`application.html#workspace/${d._id}/component`,
        ...d
      }));
      // this.data = data
      this.update()
    }

    this.on('mount', () => {
      RiotControl.on('workspace_share_collection_changed', this.refreshData)
      this.refs.table.on('rowNavigation', (data) => route('workspace/' + data._id + '/component'));
      RiotControl.trigger('workspace_collection_share_load')
    })

    this.on('unmount', () => {
      RiotControl.off('workspace_share_collection_changed', this.refreshData)
    })
  </script>
</workspace-share-table>
