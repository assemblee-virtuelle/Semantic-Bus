<value-from-path-editor  style="justify-content:center; align-items: center;">
<!-- Titre du composant -->
<div class="contenaireV title-component">VALEUR DU CHEMIN</div>
<!-- Description du composant -->
<label style="padding-top: 10px;">Extraire une valeur par son chemin</label>
<!-- Champ du composant -->
  <label style="padding-top: 10px;">Chemin vers la valeur à récupérer et la mettre à la racine</label>
  <input class="field" style="width:600px;"type="text" name="pathInput" ref="pathInput" value={data.specificData.path} onChange={pathInputChange}></input>

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
