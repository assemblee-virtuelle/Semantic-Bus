<sftp-uploader-editor>
  <!-- bouton aide -->
  <div class="containerH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-SFTP-Uploader" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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

  <label class="labelFormStandard">Hôte SFTP:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="exemple: sftp.example.com" type="text" ref="hostInput" onchange={changeHost} value={data.specificData.host}></input>
  </div>
  
  <label class="labelFormStandard">Port:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="22" type="text" ref="portInput" onchange={changePort} value={data.specificData.port}></input>
  </div>
  
  <label class="labelFormStandard">Identifiant:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="username" type="text" ref="loginInput" onchange={changeLogin} value={data.specificData.login}></input>
  </div>
  
  <label class="labelFormStandard">Mot de passe:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="password" type="password" ref="passwordInput" onchange={changePassword} value={data.specificData.password}></input>
  </div>
  
  <label class="labelFormStandard">Chemin de destination:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="/path/to/destination/" type="text" ref="pathInput" onchange={changePath} value={data.specificData.path}></input>
  </div>
  
  <label class="labelFormStandard">Nom du fichier sans extension:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="fichier" type="text" ref="fileNameInput" onchange={changeFileName} value={data.specificData.fileName}></input>
  </div>
  
  <label class="labelFormStandard">Type de contenu (pour conversion):</label>
  <div class="cardInput">
    <select class="inputComponents" ref="contentTypeInput" onchange={changeContentType}>
      <option value="application/json" selected={!data.specificData.contentType}>JSON</option>
      <option value="text/csv" selected={data.specificData.contentType === 'text/csv'}>CSV</option>
      <option value="application/vnd.ms-excel" selected={data.specificData.contentType === 'application/vnd.ms-excel'}>Excel</option>
    </select>
  </div>
  
  <label class="labelFormStandard">Créer le répertoire si nécessaire:</label>
  <div class="cardInput">
    <label class="switch">
      <input type="checkbox" ref="createDirectoryInput" checked={data.specificData.createDirectory} onchange={changeCreateDirectory}/>
      <span class="slider round"></span>
    </label>
  </div>

  <script>
    this.data = {}
    this.data.specificData = {}
    
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      if (!this.data.specificData) {
        this.data.specificData = {};
      }
      this.update();
    }.bind(this);
    
    changeHost(e) {
      this.data.specificData.host = e.currentTarget.value;
    }
    
    changePort(e) {
      this.data.specificData.port = e.currentTarget.value;
    }
    
    changeLogin(e) {
      this.data.specificData.login = e.currentTarget.value;
    }
    
    changePassword(e) {
      this.data.specificData.password = e.currentTarget.value;
    }
    
    changePath(e) {
      this.data.specificData.path = e.currentTarget.value;
    }
    
    changeFileName(e) {
      this.data.specificData.fileName = e.currentTarget.value;
    }
    
    changeContentType(e) {
      this.data.specificData.contentType = e.currentTarget.value;
    }
    
    changeCreateDirectory(e) {
      this.data.specificData.createDirectory = e.currentTarget.checked;
    }
    
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
    }.bind(this));

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</sftp-uploader-editor> 