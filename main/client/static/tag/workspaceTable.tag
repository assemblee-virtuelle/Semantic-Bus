<workspace-table class="containerV" style="flex-grow:1">
  <workspace-zen-table
    data={data}
    empty-text={'Cliquer sur le bouton "+" pour en créer un Worklow.'}
    ref="table"
  />

  <div class="containerV containerBtn">
    <img onclick={addWorkflowClick} src="./image/ajout_composant.svg" class="commandButtonImage containerV btnAddSize" title="Créer un Workflow">
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
  <style>
    .containerBtn {
      height: 10vh;
      justify-content: center;
      align-items: center;
    }
  </style>
</workspace-table>
