<rest-api-post-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Post-provider" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Post provider</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">Exposition du flux de donnée sur une API HTTP uniquement en POST.</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">Clé de l'API:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" name="urlInput" ref="urlInput" onchange={urlInputChanged} value={data.specificData.url}></input>
  </div>
  <label class="labelFormStandard">URL de l'API:</label>
  <div class="cardInput">
    <a ref="link" target="_blank" href={'http://semantic-bus.org/data/api/' +data.specificData.url}>{'http://semantic-bus.org/data/api/'+data.specificData.url}</a>
  </div>
  <label class="labelFormStandard">Content-type:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" name="contentTypeInput" ref="contentTypeInput" onchange={contentTypeInputChanged} value={data.specificData.contentType}></input>
  </div>
  <!--<label>Sortie en xls (Boolean)</label> <input type="text" name="xlsInput" ref="xlsInput"value={data.specificData.xls}></input>-->
  <script>

    this.data = {};
    this.test = function () {
      consol.log('test');
    }

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.innerData=data;      this.update();    }.bind(this),    get: function () {     return this.innerData;   },   configurable: true });

    urlInputChanged(e) {
      this.data.specificData.url = e.currentTarget.value;
    }
    contentTypeInputChanged(e) {
      this.data.specificData.contentType = e.currentTarget.value;
    }
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      // this.refs.urlInput.addEventListener('change',function(e){   this.data.specificData.url=e.currentTarget.value; }.bind(this));
      //
      // this.refs.contentTypeInput.addEventListener('change',function(e){   this.data.specificData.contentType=e.currentTarget.value; }.bind(this));
      //
      // this.refs.xlsInput.addEventListener('change',function(e){   this.data.specificData.xls =e.currentTarget.value; }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
  <style>
    a {
      color: blue;
    }
    a:active {
      color: blue;
    }

    a:visited {
      color: blue;
    }

    a:hover {
      color: blue;
    }
  </style>
</rest-api-post-editor>
