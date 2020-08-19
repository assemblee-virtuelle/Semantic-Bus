<rest-api-get-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Get-provider" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <!-- Champ du composant -->
  <label class="labelFormStandard">Clé de l'API:</label>
  <div class="cardInput cardInputApiId">
    <div class="idApi">{data._id}-</div>
    <input class="inputComponents inputApiId" placeholder="" type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.urlName}></input>
  </div>
  <label class="labelFormStandard">URL de l'API:</label>
  <div class="cardInput" show={data.specificData.url}>
    <a class="linkApi" ref="link" target="_blank" href={window.location.origin +'/data/api/'+data.specificData.url}>{window.location.origin +'/data/api/'+data.specificData.url}</a>
  </div>
  <label class="labelFormStandard">Content-type:</label>
  <div class="cardInput">
    <select class="inputComponents" name="contentTypeInput" ref="contentTypeInput" onchange={contentTypeInputChanged}>
      <option value="application/json" selected={data.specificData.contentType==='application/json' || data.specificData.contentType===undefined}>application/json</option>
      <option value="application/ld+json" selected={data.specificData.contentType==='application/ld+json'}>application/ld+json</option>
      <option value="application/xml" selected={data.specificData.contentType==='application/xml'}>application/xml</option>
      <option value="application/x-yaml" selected={data.specificData.contentType==='application/x-yaml'}>application/x-yaml</option>
      <option value="application/vnd.ms-excel" selected={data.specificData.contentType==='application/vnd.ms-excel'}>application/vnd.ms-excel</option>
      <option value="application/rdf+xml" selected={data.specificData.contentType==='application/rdf+xml'}>application/rdf+xml</option>
    </select>
  </div>
  <script>
    this.data = {};
    this.test = function () {
      consol.log('test');
    }

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.data=data;      this.update();    }.bind(this),    get: function () {     return this.data;   },   configurable: true });

    urlInputChanged(e) {
      this.data.specificData.urlName = e.currentTarget.value;
      this.data.specificData.url=this.data._id + '-'+this.data.specificData.urlName;
      // console.log('url',this.data.specificData.url);
    }
    contentTypeInputChanged(e) {
      this.data.specificData.contentType = e.currentTarget.value;
    }

    this.updateData = function (dataToUpdate) {
      this.data = Object.assign({},dataToUpdate);
      if(this.data.specificData && !this.data.specificData.contentType ){
        this.data.specificData.contentType = "application/json"
      }
      console.log('data origin',this.data.specificData);
      // const regexUrl = `${this.data._id}-`;
      // const rx = new RegExp(regexUrl, 'i');
      // if(dataToUpdate.specificData && dataToUpdate.specificData.url && dataToUpdate.specificData.url.match(rx)){
      //   this.data.specificData.url =  dataToUpdate.specificData.url.split(this.data._id+'-')[1]
      // }
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

  .cardInputApiId {
    position: relative;
    align-items: center;
    justify-content: flex-start;
    display: flex;
  }
  .inputApiId {
    padding-left: 250px;
  }
  .idApi{
    position: absolute;
    padding-left: 1vw;
    top: 1.4vh;
    font-style: italic;
    color: rgb(212,212,212);
  }
  .linkApi{
    color:rgb(180,180,180);
  }
</style>
</rest-api-get-editor>
