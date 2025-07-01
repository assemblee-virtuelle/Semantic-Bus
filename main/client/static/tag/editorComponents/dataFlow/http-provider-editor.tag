<http-provider-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-HTTP-Provider" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <label class="labelFormStandard">Clé de l'API</label>
  <div class="cardInput cardInputApiId">
    <div class="idApi">{data._id}-</div>
    <input class="inputComponents inputApiId" placeholder="" type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.urlName}></input>
  </div>
  <label class="labelFormStandard">URL de l'API</label>
  <div class="cardInput">
    <a class="linkApi" ref="link" target="_blank" href={window.location.origin +'/data/api/'+data.specificData.url}>{window.location.origin +'/data/api/'+data.specificData.url}</a>
  </div>
  <label class="labelFormStandard">Retourner un fichier brut (necessite d'avour un fichier brut dans une propriété)</label>
  <div class="cardInput">
    <label class="switch">
        <input type="checkbox" name="returnRawFile" ref="returnRawFileInput" checked={data.specificData.returnRawFile} onchange={returnRawFileChange}/>
        <span class="slider round"></span>
    </label>
  </div>
  
  <div if={!data.specificData.returnRawFile}>
    <label class="labelFormStandard">Content-type</label>
    <div class="cardInput">
      <select class="inputComponents" name="contentTypeInput" ref="contentTypeInput" onchange={contentTypeInputChanged}>
        <option value="application/json" selected={data.specificData.contentType==='application/json'}>application/json</option>
        <option value="application/ld+json" selected={data.specificData.contentType==='application/ld+json'}>application/ld+json</option>
        <option value="application/xml" selected={data.specificData.contentType==='application/xml'}>application/xml</option>
        <option value="application/x-yaml" selected={data.specificData.contentType==='application/x-yaml'}>application/x-yaml</option>
        <option value="application/vnd.ms-excel" selected={data.specificData.contentType==='application/vnd.ms-excel'}>application/vnd.ms-excel</option>
        <option value="application/rdf+xml" selected={data.specificData.contentType==='application/rdf+xml'}>application/rdf+xml</option>
        <option value="application/ics" selected={data.specificData.contentType==='application/ics'}>application/ics</option>
      </select>
    </div>
  </div>
  
  <div if={data.specificData.returnRawFile}>
    <div class="cardInput">
      <p class="infoText">Le Content-type sera déterminé automatiquement par l'extension du fichier</p>
    </div>
    
    <label class="labelFormStandard">Propriété contenant le fichier brut</label>
    <div class="cardInput">
      <input class="inputComponents" placeholder="Nom de la propriété" type="text" name="rawFileProperty" ref="rawFilePropertyInput" onchange={rawFilePropertyChanged} value={data.specificData.rawFileProperty}></input>
    </div>
    
    <label class="labelFormStandard">Nom du fichier (optionnel)</label>
    <div class="cardInput">
      <input class="inputComponents" placeholder="Nom du fichier téléchargé" type="text" name="filename" ref="filenameInput" onchange={filenameChanged} value={data.specificData.filename}></input>
    </div>
  </div>
  
  <label class="labelFormStandard">execution sans file d'attente ni blocage</label>
  <div class="cardInput">
    <label class="switch">
        <input type="checkbox" name="unrestrictedExecution" ref="unrestrictedExecutionInput" checked={data.specificData.unrestrictedExecution} onchange={unrestrictedExecutionChange}/>
        <span class="slider round"></span>
    </label>
  </div>
  <div if={!data.specificData.unrestrictedExecution}>
    <label class="labelFormStandard">Composant qui débloque la file d'attente</label>
    <div class="cardInput">
      <select class="inputComponents" name="unlockComponentIdInput" ref="unlockComponentIdInput" onchange={unlockComponentIdInputChanged}>
        <option value="undefined">non-défini</option>
        <option each={option in components} value={option._id} selected={parent.data.specificData.unlockComponentId ==option._id}>{option.type} : {option.name}</option>
      </select>
    </div>
  </div>
  <label class="labelFormStandard">réponse http sans données</label>
  <div class="cardInput">
    <label class="switch">
        <input type="checkbox" name="responseWithoutExecution" ref="responseWithoutExecutionInput" checked={data.specificData.responseWithoutExecution} onchange={responseWithoutExecutionChange}/>
        <span class="slider round"></span>
    </label>
  </div>
  
  <div if={!data.specificData.responseWithoutExecution}>
    <label class="labelFormStandard">Composant qui effectura la reponse http</label>
    <div class="cardInput">
      <select class="inputComponents" name="responseComponentIdInput" ref="responseComponentIdInput" onchange={responseComponentIdInputChanged}>
        <option value="undefined">non-défini</option>
        <option each={option in components} value={option._id} selected={parent.data.specificData.responseComponentId ==option._id}>{option.type} : {option.name}</option>
      </select>
    </div>
  </div>
  <!--<label>Sortie en xls (Boolean)</label> <input type="text" name="xlsInput" ref="xlsInput"value={data.specificData.xls}></input>-->
  <script>

    this.data = {};

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.data=data;      this.update();    }.bind(this),    get: function () {     return this.data;   },   configurable: true });

    urlInputChanged(e) {
      this.data.specificData.urlName = e.currentTarget.value;
      this.data.specificData.url=this.data._id + '-'+this.data.specificData.urlName;
    }

    contentTypeInputChanged = e => {
      this.data.specificData.contentType = e.currentTarget.value;
    };


    responseComponentIdInputChanged(e){
      this.data.specificData.responseComponentId = e.currentTarget.value;
    }
    contentTypeInputChanged(e) {
      this.data.specificData.contentType = e.currentTarget.value;
    }

    responseWithoutExecutionChange(event){
        this.data.specificData.responseWithoutExecution = event.target.checked
    }

    unrestrictedExecutionChange(event){
        this.data.specificData.unrestrictedExecution = event.target.checked
    }

    returnRawFileChange(event){
        this.data.specificData.returnRawFile = event.target.checked
    }

    rawFilePropertyChanged(e){
        this.data.specificData.rawFileProperty = e.currentTarget.value;
    }

    filenameChanged(e){
        this.data.specificData.filename = e.currentTarget.value;
    }

    unlockComponentIdInputChanged(e){
      this.data.specificData.unlockComponentId = e.currentTarget.value;
    }
    

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      if (this.data.specificData.contentType==undefined){
        this.data.specificData.contentType='application/json';
      }
      if (this.data.specificData.url==undefined){
        this.data.specificData.url=this.data._id+'-'
      } 
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
    .infoText {
      color: #666;
      font-style: italic;
      font-size: 0.9em;
      margin: 5px 0;
    }
  </style>
</http-provider-editor>
