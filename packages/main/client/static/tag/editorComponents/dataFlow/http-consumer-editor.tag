<http-consumer-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-HTTP-Consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">URL externe où envoyer les données:</label>
  <div class="cardInput" style="display: flex; align-items: center; gap: 10px;">
    <input class="inputComponents" placeholder="" type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.url} style="flex: 1;"></input>
    <span if={linkedProvider} onclick={showProviderPopup}
          title="Lié au composant provider" 
          style="display: flex; align-items: center; cursor: pointer; color: #0066cc;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"/>
      </svg>
    </span>
    <span if={!linkedProvider} 
          title="Aucun lien vers un provider" 
          style="display: flex; align-items: center; color: #cccccc;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"/>
      </svg>
    </span>
  </div>
  
  <!-- Popup for provider info -->
  <div if={showProviderListPopup} class="provider-overlay" onclick={closeProviderPopup}>
    <div class="provider-popup" onclick={preventClosePopup}>
      <div class="popup-header">
        <h3>Provider lié à ce consumer</h3>
        <span onclick={closeProviderPopup} class="close-button">×</span>
      </div>
      <div class="popup-content">
        <div if={linkedProvider} class="table-container">
          <div class="table-header">
            <div class="table-col-name">NOM</div>
            <div class="table-col-description">DESCRIPTION</div>
            <div class="table-col-action"></div>
          </div>
          <div class="table-body">
            <div class="table-row">
              <div class="table-col-name">{linkedProvider.providerWorkspaceName || 'Workflow'}</div>
              <div class="table-col-description">{linkedProvider.providerComponentName || ''}</div>
              <div class="table-col-action">
                <a href={'#workspace/' + linkedProvider.providerWorkspaceId + '/component/' + linkedProvider.providerComponentId + '/edit-component'}>
                  <img class="commandButtonImage" src="./image/pencil.svg" height="20px" title="Éditer le composant">
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="options">
    <label class="labelFormStandard">corp de requête vide:</label>
    <div class="cardInput">
      <label class="switch">
          <input type="checkbox" name="noBodyInput" ref="noBodyInput" checked={data.specificData.noBody} onchange={noBodyChange}/>
          <span class="slider round"></span>
      </label>
    </div>
  </div>
  <label class="labelFormStandard" ref="bodyPathLabel">chemin qui contient le body:</label>
  <div class="cardInput" ref="bodyPathInput">
    <input class="inputComponents" type="text" name="bodyPathInput" onChange={bodyPathInputChanged} value={data.specificData.bodyPath}></input>
  </div>
    <label class="labelFormStandard" ref="contentTypeLabel">Content Type</label>
  <div class="cardInput" ref="contentTypeInput">
    <select class="inputComponents" name="contentTypeInput" onchange={contentTypeInputChanged}>
      <option value="application/json" selected={data.specificData.contentType==='application/json' || data.specificData.contentType===undefined}>application/json</option>
      <option value="application/ld+json" selected={data.specificData.contentType==='application/ld+json'}>application/ld+json</option>
      <option value="text/plain" selected={data.specificData.contentType==='text/plain'}>text/plain</option>
      <option value="application/x-www-form-urlencoded" selected={data.specificData.contentType==='application/x-www-form-urlencoded'}>application/x-www-form-urlencoded</option>
    </select>
  </div>
  <label class="labelFormStandard">Methode:</label>
  <div class="cardInput" ref="methodInput">
    <select class="inputComponents" name="methodInput" onchange={methodInputChanged}>
      <option value="GET" selected={data.specificData.method==='GET' || data.specificData.method===undefined}>GET</option>
      <option value="POST" selected={data.specificData.method==='POST'}>POST</option>
      <option value="PATCH" selected={data.specificData.method==='PATCH'}>PATCH</option>
      <option value="PUT" selected={data.specificData.method==='PUT'}>PUT</option>
      <option value="DELETE" selected={data.specificData.method==='DELETE'}>DELETE</option>
    </select>
  </div>
  <label class="labelFormStandard">Temps de réponse accordé (TimeOut):</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="20" type="text" name="timeoutInput" ref="timeoutInput" onChange={timeoutInputChanged} value={data.specificData.timeout}></input>
  </div>
  <label class="labelFormStandard">nombre de tentatives:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="1" type="text" name="retryInput" ref="retryInput" onChange={retryInputChanged} value={data.specificData.retry}></input>
  </div>

  <label class="labelFormStandard">Content-type de réponse forcé:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="overidedContentTypeInput" value={data.specificData.overidedContentType} onchange={overidedContentTypeInputChange}></input>
  </div>

  <label class="labelFormStandard">conservation du fichier binaire:</label>
  <div class="cardInput">
    <label class="switch">
        <input type="checkbox" name="rawFileInput" ref="rawFileInput" checked={data.specificData.rawFile} onchange={rawFileChange}/>
        <span class="slider round"></span>
    </label>
  </div>

  <div class="options">
    <label class="labelFormStandard">certification</label>
    <div class="cardInput">
      <label class="switch">
          <input type="checkbox" name="certificateUsingInput" ref="certificateUsingInput" checked={data.specificData.certificateUsing} onchange={certificateUsingChange}/>
          <span class="slider round"></span>
      </label>
    </div>
  </div>
  <label class="labelFormStandard" ref="certificateLabel">certificat pfx (doit être une propriété faisant reference à un fichier interne uploadé ex:_file)</label>
  <div class="cardInput" ref="certificateInput">
    <input class="inputComponents" placeholder="" type="text" value={data.specificData.certificateProperty} onchange={certificatePropertyInputChange}></input>
  </div>
  <label class="labelFormStandard" ref="certificatePassphraseLabel">passphrase pfx</label>
  <div class="cardInput" ref="certificatePassphraseInput">
    <input class="inputComponents" placeholder="" type="text" value={data.specificData.certificatePassphrase} onchange={certificatePassphraseInputChange}></input>
  </div>

  <label class="labelFormStandard">Header</label>
  <div class="cardInput">
    <div onclick={addRowClick} class="btnFil commandButtonImage">
      Ajouter
      <img class="imgFil" src="./image/ajout_composant.svg" title="Importer un header">
      <input onchange={import} ref="import" type="file" style="display:none;"/>
    </div>
  </div>
  <zentable ref="headerTable" title="header de la requete" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="row">
      <input placeholder="Clé" type="text" style="flex-basis:50%; margin: 5px" value={key} data-field="key"/>
      <input placeholder="Valeur" type="text" style="flex-basis:50%; margin: 5px" value={value} data-field="value"/>
    </yield>
  </zentable>

  <script>
    this.data = {};
    this.linkedProvider = null;
    this.showProviderListPopup = false;
    
    urlInputChanged = e => {
      this.data.specificData.url = e.currentTarget.value;
      this.checkHttpLinks();
    };
    
    this.showProviderPopup = function(e) {
      e.stopPropagation();
      if (this.linkedProvider) {
        this.showProviderListPopup = true;
        this.update();
      }
    }.bind(this);
    
    this.closeProviderPopup = function() {
      this.showProviderListPopup = false;
      this.update();
    }.bind(this);
    
    this.preventClosePopup = function(e) {
      e.stopPropagation();
    };
    
    this.checkHttpLinks = function() {
      if (this.data && this.data._id) {
        RiotControl.trigger('http_links_get_provider_for_consumer', this.data._id);
      }
    }.bind(this);
    
    this.updateHttpLinks = function(result) {
      if (result && result.consumerComponentId === this.data._id) {
        this.linkedProvider = result.providerInfo;
        this.update();
      }
    }.bind(this);

    timeoutInputChanged = e => {
      this.data.specificData.timeout = e.currentTarget.value;
    };

    retryInputChanged = e => {
      this.data.specificData.retry = e.currentTarget.value;
    };

    methodInputChanged(e) {
      this.data.specificData.method = e.currentTarget.value;
    }

    contentTypeInputChanged(e) {
      console.log('ALLO',e)
      this.data.specificData.contentType = e.currentTarget.value;
    }


    bodyPathInputChanged(e) {
      this.data.specificData.bodyPath = e.currentTarget.value;
    }

    noBodyChange(event){
        this.data.specificData.noBody = event.target.checked;
        this.methodInputVisibility();
    }

    certificateUsingChange(event){
        this.data.specificData.certificateUsing = event.target.checked;
        this.certificateUsingInputVisibility();
    }

    overidedContentTypeInputChange = function (e) {
      this.data.specificData.overidedContentType = e.target.value;
    }

    certificatePropertyInputChange = function (e) {
      this.data.specificData.certificateProperty = e.target.value;
    }

    certificatePassphraseInputChange = function (e) {
      this.data.specificData.certificatePassphrase = e.target.value;
    }

    this.addRowClick = function (e) {
      this.refs.headerTable.data.push({})
    }

    methodInputVisibility(specificData){
      if(this.data.specificData.noBody!=true){
        this.refs.contentTypeInput.classList.remove("hide");
        this.refs.contentTypeLabel.classList.remove("hide");
        this.refs.bodyPathInput.classList.remove("hide");
        this.refs.bodyPathLabel.classList.remove("hide");
      }else{
        this.refs.contentTypeInput.classList.add("hide");
        this.refs.contentTypeLabel.classList.add("hide");
        this.refs.bodyPathInput.classList.add("hide");
        this.refs.bodyPathLabel.classList.add("hide");
      }
    }

    certificateUsingInputVisibility(specificData){
      if(this.data.specificData){
        if(this.data.specificData.certificateUsing!=true){
          this.refs.certificatePassphraseInput.classList.add("hide");
          this.refs.certificatePassphraseLabel.classList.add("hide");
          this.refs.certificateInput.classList.add("hide");
          this.refs.certificateLabel.classList.add("hide");
        }else{
          this.refs.certificatePassphraseInput.classList.remove("hide");
          this.refs.certificatePassphraseLabel.classList.remove("hide");
          this.refs.certificateInput.classList.remove("hide");
          this.refs.certificateLabel.classList.remove("hide");
        }
      }

    }

    this.profilCertificatesChanged = function (certificates) {
      this.refs.certificates.data = certificates;
      this.update();
    }.bind(this);

    rawFileChange(event) {
      this.data.specificData.rawFile = event.target.checked;
    }


    this.updateData = dataToUpdate => {
      this.data = dataToUpdate;
      this.refs.headerTable.data = this.data.specificData.headers || [];
      this.methodInputVisibility();
      this.certificateUsingInputVisibility();
      this.checkHttpLinks();
      this.update();
    };
    this.on('mount', function () {
      this.refs.headerTable.on('dataChanged', data => {
        this.data.specificData.headers = data;
      });
      this.refs.headerTable.on('delRow', row => {
        this.refs.headerTable.data.splice(row.rowid, 1);
      });
      RiotControl.on('item_current_changed', this.updateData);
      RiotControl.on('profil_certificates_changed', this.profilCertificatesChanged);
      RiotControl.on('http_links_provider_for_consumer_result', this.updateHttpLinks);
      RiotControl.on('http_links_loaded', this.checkHttpLinks);
      RiotControl.trigger('profil_get_certificates');
      RiotControl.trigger('http_links_load');
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('http_links_provider_for_consumer_result', this.updateHttpLinks);
      RiotControl.off('http_links_loaded', this.checkHttpLinks);
    });


  </script>
  <style>
  .hide {
    display: none;
  }
  
  /* Popup styles - similar to jsonFragViewer.tag */
  .provider-overlay {
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
  
  .provider-popup {
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
  </style>
</http-consumer-editor>
