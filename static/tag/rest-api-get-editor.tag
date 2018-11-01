<rest-api-get-editor style="justify-content:center; align-items: center;">
<!-- Titre du composant -->
  <div class="contenaireV title-component">REST API GET</div>
<!-- Description du composant -->
  <label style="padding-top: 10px;">Exposition du flux de donnée sur une API http uniquement en GET</label>
<!-- Champ du composant -->
  <label style="padding-top: 10px;">Clé de l'API</label>
  <input class="field" style="width:600px;"placeholder="champ libre"type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.url}></input>
  <label style="padding-top: 10px;">url de l'API</label>
  <a ref="link" href={'http://semantic-bus.org/data/api/' +data.specificData.url}>{'http://semantic-bus.org/data/api/'+data.specificData.url}</a>
  <label style="padding-top: 10px;">Type de contenu</label>
  <input class="field" style="width:600px;"placeholder="application/json" type="text" name="contentTypeInput" ref="contentTypeInput" onChange={contentTypeInputChanged} value={data.specificData.contentType}></input>

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
  a{
    color: blue;
  }
  a:active{
    color: blue;
  }

  a:visited{
    color: blue;
  }

  a:hover{
    color: blue;
  }
  </style>
</rest-api-get-editor>
