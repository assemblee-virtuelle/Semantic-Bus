<filter-editor>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">FILTRE</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Filtrer le flux</label>

  <jsonEditor ref="filterObjectInput" title="Filter Schema" style="flex:1" modes="['tree','text']"></jsonEditor>

  <script>
    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.filterString=this.data.specificData.filterString||"{}";
      this.refs.filterObjectInput.data = JSON.parse(this.data.specificData.filterString);
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.refs.filterObjectInput.on('change',function(e){
        this.data.specificData.filterString=JSON.stringify(this.refs.filterObjectInput.data);
      }.bind(this));
      RiotControl.on('item_current_changed',this.updateData);
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</filter-editor>
