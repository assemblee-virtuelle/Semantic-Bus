<bigdataflow-table class="containerV" style="flex-grow:1">
  <div class="containerH" style="justify-content:center">
    <h1>Le Big Data arrive dans Grappe.io, Patience</h1>
  </div>


  <workspace-zen-table
    data={data}
    empty-text={'Cliquer sur le bouton "+" pour en créer un BigDataFlow'}
    ref="table"
  />
<!--
  <div class="containerV containerBtn">
    <img onclick={addBigdataflowClick} src="./image/ajout_composant.svg" class="commandButtonImage containerV btnAddSize" title="Créer un BigDataFlow">
  </div>
-->
  <script>
    this.data = []

    this.refreshData = (data) => {
      this.data = data
      this.update()
    }

    this.addBigdataflowClick = () => {
      route('bigdataflow/new/information')
    }

    this.on('mount', () => {
      this.refs.table.on('deleteRow', (data) => RiotControl.trigger('bigdataflow_delete', data))
      this.refs.table.on('rowNavigation', (data) => route('bigdataflow/' + data._id + '/main'));
      RiotControl.on('bigdataflow-collection-changed', this.refreshData)
      RiotControl.trigger('bigdataflow-collection-load')
    })

    this.on('unmount', () => {
      RiotControl.off('bigdataflow-collection-changed', this.refreshData)
    })
  </script>
  <style>
    .containerBtn {
      height: 10vh;
      justify-content: center;
      align-items: center;
    }
  </style>
</bigdataflow-table>
