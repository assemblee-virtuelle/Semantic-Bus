<imap-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-IMAP" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <!-- Champs du composant -->
  <label class="labelFormStandard">Nom d'utilisateur IMAP:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="usernameInput" onchange={usernameChange} value={data.specificData.username}/>
  </div>

  <label class="labelFormStandard">Mot de passe IMAP:</label>
  <div class="cardInput">
    <input class="inputComponents" type="password" ref="passwordInput" onchange={passwordChange} value={data.specificData.password}/>
  </div>

    <label class="labelFormStandard">Access Token Oauth2:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="accessTokenInput" onchange={accessTokenChange} value={data.specificData.accessToken}/>
  </div>

  <label class="labelFormStandard">Hôte IMAP:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="hostInput" onchange={hostChange} value={data.specificData.host}/>
  </div>

  <label class="labelFormStandard">Port IMAP:</label>
  <div class="cardInput">
    <input class="inputComponents" type="number" ref="portInput" onchange={portChange} value={data.specificData.port}/>
  </div>

  <label class="labelFormStandard">Utiliser TLS:</label>
  <div class="cardInput">
    <label class="switch">
      <input type="checkbox" ref="tlsInput" onchange={tlsChange} checked={data.specificData.tls}/>
      <span class="slider round"></span>
    </label>
  </div>

  <label class="labelFormStandard">Boîte mail à surveiller:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="mailboxInput" onchange={mailboxChange} value={data.specificData.mailbox}/>
  </div>

  <label class="labelFormStandard">Filtre de recherche:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="searchFilterInput" onchange={searchFilterChange} value={data.specificData.searchFilter}/>
  </div>

  <label class="labelFormStandard">Marquer les emails comme lus:</label>
  <div class="cardInput">
    <label class="switch">
      <input type="checkbox" ref="markSeenInput" onchange={markSeenChange} checked={data.specificData.markSeen}/>
      <span class="slider round"></span>
    </label>
  </div>

  <label class="labelFormStandard">Récupérer les emails non lus au démarrage:</label>
  <div class="cardInput">
    <label class="switch">
      <input type="checkbox" ref="fetchUnreadOnStartInput" onchange={fetchUnreadOnStartChange} checked={data.specificData.fetchUnreadOnStart}/>
      <span class="slider round"></span>
    </label>
  </div>

  <label class="labelFormStandard">Télécharger les pièces jointes:</label>
  <div class="cardInput">
    <label class="switch">
      <input type="checkbox" ref="attachmentsInput" onchange={attachmentsChange} checked={data.specificData.attachments}/>
      <span class="slider round"></span>
    </label>
  </div>

  <label class="labelFormStandard">Dossier de téléchargement des pièces jointes:</label>
  <div class="cardInput">
    <input class="inputComponents" type="text" ref="attachmentsDirInput" onchange={attachmentsDirChange} value={data.specificData.attachmentsDir}/>
  </div>



  <style>
    .inputComponents {
      width: 100%; /* Harmonise la largeur */
      height: 30px; /* Harmonise la hauteur */
      padding: 5px; /* Ajoute un espacement intérieur */
      box-sizing: border-box; /* Inclut le padding et la bordure dans la largeur totale */
      font-size: 14px; /* Harmonise la taille du texte */
    }
  </style>

  <script>
    this.data = {
      specificData: {}
    };

    this.updateData = function(dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.usernameChange = (e) => {
      this.data.specificData.username = e.target.value;
    }

    this.passwordChange = (e) => {
      this.data.specificData.password = e.target.value;
    }

    this.hostChange = (e) => {
      this.data.specificData.host = e.target.value;
    }

    this.portChange = (e) => {
      this.data.specificData.port = parseInt(e.target.value);
    }

    this.tlsChange = (e) => {
      this.data.specificData.tls = e.target.checked;
    }

    this.mailboxChange = (e) => {
      this.data.specificData.mailbox = e.target.value;
    }

    this.searchFilterChange = (e) => {
      this.data.specificData.searchFilter = e.target.value;
    }

    this.markSeenChange = (e) => {
      this.data.specificData.markSeen = e.target.checked;
    }

    this.fetchUnreadOnStartChange = (e) => {
      this.data.specificData.fetchUnreadOnStart = e.target.checked;
    }

    this.attachmentsChange = (e) => {
      this.data.specificData.attachments = e.target.checked;
    }

    this.attachmentsDirChange = (e) => {
      this.data.specificData.attachmentsDir = e.target.value;
    }

    this.accessTokenChange = (e) => {
      this.data.specificData.accessToken = e.target.value;
    }

    this.on('mount', function() {
      RiotControl.on('item_current_changed', this.updateData);
    });

    this.on('unmount', function() {
      RiotControl.off('item_current_changed', this.updateData);
    });

    // Exemple de fonction pour utiliser l'access_token avec IMAP
    this.connectWithOAuth2 = function() {
      const accessToken = this.data.specificData.accessToken;
      // Utilisez l
    }
  </script>
</imap-editor>
