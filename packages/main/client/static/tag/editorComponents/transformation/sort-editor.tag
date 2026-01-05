<sort-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Sort" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Aide syntaxe -->
  <div class="help-text" style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">
    <strong>Syntaxe MongoDB :</strong><br/>
    • Tri ascendant : <code>\{ "field": 1 \}</code><br/>
    • Tri descendant : <code>\{ "field": -1 \}</code><br/>
    • Tri multiple : <code>\{ "field1": 1, "field2": -1 \}</code><br/>
    • Chemin imbriqué : <code>\{ "parent.child": 1 \}</code>
  </div>
  <!-- Champ du composant -->
  <jsonEditor ref="sortObjectInput" title="Sort Schema" style="flex:1" modes="['tree','text']"></jsonEditor>

  <script>
    this.updateData=function(dataToUpdate){
      this.data = dataToUpdate;
      this.data.specificData=this.data.specificData||{};
      this.data.specificData.sortString=this.data.specificData.sortString||"{}";
      this.refs.sortObjectInput.data = JSON.parse(this.data.specificData.sortString);
      this.update();
    }.bind(this);

    this.on('mount', function () {
      this.refs.sortObjectInput.on('change',function(e){
        this.data.specificData.sortString=JSON.stringify(this.refs.sortObjectInput.data);
      }.bind(this));
      RiotControl.on('item_current_changed',this.updateData);
    });

    this.on('unmount', function () {
      RiotControl.off('item_current_changed',this.updateData);
    });

  </script>
</sort-editor>

