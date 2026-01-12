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
  <div class="cardInput" style="display: flex; align-items: center; gap: 10px;">
    <a class="linkApi" ref="link" target="_blank" href={window.location.origin +'/data/api/'+data.specificData.url} style="flex: 1;">{window.location.origin +'/data/api/'+data.specificData.url}</a>
    <span onclick={showConsumersPopup} 
          title={linkedConsumers && linkedConsumers.length > 0 ? 'Workflows utilisant ce provider (' + linkedConsumers.length + ')' : 'Aucun workflow n\'utilise ce provider'} 
          style={'display: flex; align-items: center; cursor: ' + (linkedConsumers && linkedConsumers.length > 0 ? 'pointer' : 'default') + '; color: ' + (linkedConsumers && linkedConsumers.length > 0 ? '#0066cc' : '#cccccc') + ';'}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"/>
      </svg>
    </span>
  </div>
  
  <!-- Popup for consumers list -->
  <div if={showConsumersListPopup} class="consumers-overlay" onclick={closeConsumersPopup}>
    <div class="consumers-popup" onclick={preventClosePopup}>
      <div class="popup-header">
        <h3>Workflows utilisant ce provider</h3>
        <span onclick={closeConsumersPopup} class="close-button">×</span>
      </div>
      <div class="popup-content">
        <p if={linkedConsumers && linkedConsumers.length > 0}>
          {linkedConsumers.length} workflow{linkedConsumers.length > 1 ? 's' : ''} utilise{linkedConsumers.length > 1 ? 'nt' : ''} cette URL:
        </p>
        <!-- Table header like workspace-zen-table -->
        <div if={linkedConsumers && linkedConsumers.length > 0} class="table-container">
          <div class="table-header">
            <div class="table-col-name">NOM</div>
            <div class="table-col-description">DESCRIPTION</div>
            <div class="table-col-action"></div>
          </div>
          <!-- Table rows -->
          <div class="table-body">
            <div each={item in linkedConsumers} class="table-row">
              <div class="table-col-name">{item.consumerWorkspaceName || 'Workflow'}</div>
              <div class="table-col-description">{item.consumerComponentName || ''}</div>
              <div class="table-col-action">
                <a href={'#workspace/' + item.consumerWorkspaceId + '/component/' + item.consumerComponentId + '/edit-component'}>
                  <img class="commandButtonImage" src="./image/pencil.svg" height="20px" title="Éditer le composant">
                </a>
              </div>
            </div>
          </div>
        </div>
        <div if={!linkedConsumers || linkedConsumers.length === 0} class="consumers-empty">
          Aucun workflow n'utilise actuellement ce provider.
        </div>
      </div>
    </div>
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
    this.linkedConsumers = [];
    this.showConsumersListPopup = false;

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.data=data;      this.update();    }.bind(this),    get: function () {     return this.data;   },   configurable: true });

    urlInputChanged(e) {
      this.data.specificData.urlName = e.currentTarget.value;
      this.data.specificData.url=this.data._id + '-'+this.data.specificData.urlName;
      this.checkHttpLinks();
    }
    
    this.checkHttpLinks = function() {
      if (this.data && this.data._id) {
        RiotControl.trigger('http_links_get_consumers_for_provider', this.data._id);
      }
    }.bind(this);
    
    this.updateHttpLinks = function(result) {
      if (result && result.providerComponentId === this.data._id) {
        this.linkedConsumers = result.consumers || [];
        this.update();
      }
    }.bind(this);
    
    this.showConsumersPopup = function(e) {
      e.stopPropagation();
      if (this.linkedConsumers && this.linkedConsumers.length > 0) {
        this.showConsumersListPopup = true;
        this.update();
      }
    }.bind(this);
    
    this.closeConsumersPopup = function() {
      this.showConsumersListPopup = false;
      this.update();
    }.bind(this);
    
    this.preventClosePopup = function(e) {
      e.stopPropagation();
    };

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
      this.checkHttpLinks();
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
      RiotControl.on('http_links_consumers_for_provider_result', this.updateHttpLinks);
      RiotControl.on('http_links_loaded', this.checkHttpLinks);
      RiotControl.trigger('workspace_current_refresh');
      RiotControl.trigger('http_links_load');

    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('workspace_current_changed', this.updateWorkspace);
      RiotControl.off('http_links_consumers_for_provider_result', this.updateHttpLinks);
      RiotControl.off('http_links_loaded', this.checkHttpLinks);

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
    
    /* Popup styles - similar to jsonFragViewer.tag */
    .consumers-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    
    .consumers-popup {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      width: 600px;
      max-width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 10px;
    }
    
    .popup-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2em;
    }
    
    .close-button {
      cursor: pointer;
      font-size: 1.8em;
      line-height: 1;
      color: #999;
      transition: color 0.2s;
    }
    
    .close-button:hover {
      color: #333;
    }
    
    .popup-content {
      margin-bottom: 10px;
    }
    
    .popup-content p {
      margin-bottom: 15px;
      color: #555;
    }
    
    /* Table styles - similar to workspace-zen-table.tag */
    .table-container {
      width: 100%;
    }
    
    .table-header {
      border-radius: 2px;
      display: flex;
      align-items: center;
      background-color: rgb(26,145,194);
      padding: 8px 0;
    }
    
    .table-header .table-col-name,
    .table-header .table-col-description {
      font-size: 0.85em;
      color: white;
      padding-left: 10px;
    }
    
    .table-col-name {
      flex: 0.4;
    }
    
    .table-col-description {
      flex: 0.45;
    }
    
    .table-col-action {
      flex: 0.15;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .table-body {
      display: flex;
      flex-direction: column;
    }
    
    .table-row {
      display: flex;
      align-items: center;
      padding: 10px 0;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
      background-color: white;
      border-radius: 2px;
    }
    
    .table-row:hover {
      background-color: #f5f5f5;
    }
    
    .table-row .table-col-name,
    .table-row .table-col-description {
      font-size: 0.85em;
      padding-left: 10px;
    }
    
    .table-row .table-col-action img {
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    
    .table-row:hover .table-col-action img {
      opacity: 1;
    }
    
    .consumers-empty {
      text-align: center;
      color: #999;
      font-style: italic;
      padding: 30px;
    }
  </style>
</http-provider-editor>
