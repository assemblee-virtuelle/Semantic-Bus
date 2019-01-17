<workspace-table class="containerV" style="flex-grow:1">
  <workspace-zen-table
    data={data}
    empty-text={'Cliquer sur le bouton "+" pour en créer un Worklow.'}
    ref="table"
  />

  <div class="containerV" style="flex-basis: 45px;justify-content: flex-start;;flex-grow:0;flex-shrink:0">
    <div onclick={addWorkflowClick} class="commandButtonImage containerV" style="flex-grow:0;flex-shrink:0">
      <img src="./image/ajout_composant.svg" title="Créer un Workflow" height="40px" width="40px">
    </div>
  </div>

  <script>
    this.data = []

    this.refreshData = (data) => {
      this.data = data
      this.update()
    }

    this.addWorkflowClick = () => {
      route('workspace/new/information')
    }

    this.on('mount', () => {
      this.refs.table.on('deleteRow', (data) => RiotControl.trigger('workspace_delete', data))
      RiotControl.on('workspace_collection_changed', this.refreshData)
      RiotControl.trigger('workspace_collection_load')
    })

    this.on('unmount', () => {
      RiotControl.off('workspace_collection_changed', this.refreshData)
    })
  </script>
</workspace-table>
