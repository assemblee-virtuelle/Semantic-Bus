<rest-api-post-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-HTTP-Provider" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
 <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div class="contenaireV warning">Ce composant est déprécié, utilisez HTTP Provider à la place</div>
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
  <div class="cardInput">
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
  <label class="labelFormStandard">Composant qui contient le flux principal:</label>
  <div class="cardInput">
    <select class="inputComponents" name="responseComponentIdInput" ref="responseComponentIdInput" onchange={responseComponentIdInputChanged}>
      <option value="undefined">non-défini</option>
      <option each={option in components} value={option._id} selected={parent.data.specificData.responseComponentId ==option._id}>{option.type} : {option.name}</option>
    </select>
  </div>
  <!--<label>Sortie en xls (Boolean)</label> <input type="text" name="xlsInput" ref="xlsInput"value={data.specificData.xls}></input>-->
  <script>

    this.data = {};
    this.test = function () {
      consol.log('test');
    }

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.data=data;      this.update();    }.bind(this),    get: function () {     return this.data;   },   configurable: true });

    urlInputChanged(e) {
      console.log(e.currentTarget.value);
      this.data.specificData.urlName = e.currentTarget.value;
      this.data.specificData.url=this.data._id + '-'+this.data.specificData.urlName;
    }

    contentTypeInputChanged = e => {
      this.data.specificData.contentType = e.currentTarget.value;
    };


    responseComponentIdInputChanged(e){
      console.log(e.currentTarget.value);
      this.data.specificData.responseComponentId = e.currentTarget.value;
    }
    contentTypeInputChanged(e) {
      this.data.specificData.contentType = e.currentTarget.value;
    }
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);
    $
    this.updateWorkspace = (workspace) =>{
      this.components = workspace.components;
    }

    this.on('mount', function () {
      // this.refs.secondaryFlowIdInput.addEventListener('change', function (e) {
      //   this.data.specificData.secondaryFlowId = e.currentTarget.value;
      // }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
      RiotControl.on('workspace_current_changed', this.updateWorkspace);
      RiotControl.trigger('workspace_current_refresh');

    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('workspace_current_changed', this.updateWorkspace);

    });
  </script>
  <style>
    /* a {
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
    } */

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
</rest-api-post-editor>
