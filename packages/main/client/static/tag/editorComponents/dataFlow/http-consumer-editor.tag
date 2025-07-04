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
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.url}></input>
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
    urlInputChanged = e => {
      this.data.specificData.url = e.currentTarget.value;
    };

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
      RiotControl.trigger('profil_get_certificates')
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });


  </script>
  <style>
  .hide {
    display: none;
  }
  </style>
</http-consumer-editor>
