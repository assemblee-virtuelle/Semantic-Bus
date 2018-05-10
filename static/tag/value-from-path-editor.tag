<value-from-path-editor>

  <label>chemin vers la valeur à récupérer et mettre à a racine</label>
  <input type="text" name="pathInput" ref="pathInput" value={data.specificData.path} onChange={pathInputChange}></input>


  <script>

    this.updateData=function(dataToUpdate){
      this.data=dataToUpdate;
      this.update();
    }.bind(this);

    this.pathInputChange=function(e){
      this.data.specificData.path=e.target.value;
    }.bind(this);


    this.on('mount', function () {
      RiotControl.on('item_current_changed',this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });
  </script>
</value-from-path-editor>
