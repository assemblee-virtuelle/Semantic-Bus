<google-auth-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
     <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Google-Auth" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
    <!-- Sélection des scopes OAuth2 -->
  <div class="scope-selection">
    <h3>Sélectionnez les scopes OAuth2 :</h3>
    <div each={domain in scopeOptions}>
      <details>
        <summary>{domain.label}</summary>
        <div each={scope in domain.scopes}>
          <input type="checkbox" name={scope.name} value={scope.url} onchange={toggleScope} 
                 checked={data.specificData.selectedScopes?.includes(scope.url)}>
            {scope.name}
          </input>
        </div>
      </details>
    </div>
  </div>
  <!-- Bouton de connexion -->
  <button onclick={handleOAuthRedirect}>Connecter avec Google (Attention, seul les scopes sauvegardé sont pris en compte)</button>

  <!-- Aperçu JSON des tokens -->
  <jsonfragviewer ref="jsonfragviewer" data={data.specificData.tokens}></jsonfragviewer>



  <script>
    this.data = {
      specificData: {
        selectedScopes: [] // Initialisation ici
      }
    };

    this.updateData = function(dataToUpdate) {
      this.data = dataToUpdate;
      dataToUpdate.specificData.selectedScopes = this.data.specificData.selectedScopes||[];
      if ( dataToUpdate.specificData.tokens?.expiry_date){
        dataToUpdate.specificData.tokens.expiry_date_iso=new Date(dataToUpdate.specificData.tokens.expiry_date).toISOString();
      }
      this.update();
      this.refreshTokens(dataToUpdate.specificData.tokens);
    }.bind(this);

    this.refreshTokens = function(tokens) {
      this.refs.jsonfragviewer.data = tokens;
      this.update();
    }.bind(this);

    // To complete with https://developers.google.com/identity/protocols/oauth2/scopes?hl=fr

    this.scopeOptions = [
      {
        label: "Google Drive",
        scopes: [
          { name: "drive", url: "https://www.googleapis.com/auth/drive" },
          { name: "drive_file", url: "https://www.googleapis.com/auth/drive.file" },
          { name: "drive_readonly", url: "https://www.googleapis.com/auth/drive.readonly" },
          { name: "drive_metadata_readonly", url: "https://www.googleapis.com/auth/drive.metadata.readonly" },
          { name: "drive_appdata", url: "https://www.googleapis.com/auth/drive.appdata" }
        ]
      },
      {
        label: "Google Calendar",
        scopes: [
          { name: "calendar", url: "https://www.googleapis.com/auth/calendar" },
          { name: "calendar_readonly", url: "https://www.googleapis.com/auth/calendar.readonly" }
        ]
      },
      {
        label: "Google Contacts",
        scopes: [
          { name: "contacts", url: "https://www.googleapis.com/auth/contacts" },
          { name: "contacts_readonly", url: "https://www.googleapis.com/auth/contacts.readonly" }
        ]
      },
      {
        label: "Google Gmail",
        scopes: [
          { name: "gmail imap", url: "https://mail.google.com/" },
          { name: "gmail_readonly", url: "https://www.googleapis.com/auth/gmail.readonly" },
          { name: "gmail_send", url: "https://www.googleapis.com/auth/gmail.send" },
          { name: "gmail_modify", url: "https://www.googleapis.com/auth/gmail.modify" },
          { name: "gmail_labels", url: "https://www.googleapis.com/auth/gmail.labels" }
        ]
      },
      {
        label: "Google Cloud",
        scopes: [
          { name: "cloud_platform", url: "https://www.googleapis.com/auth/cloud-platform" },
          { name: "cloud_platform_readonly", url: "https://www.googleapis.com/auth/cloud-platform.read-only" }
        ]
      },
      {
        label: "Google Analytics",
        scopes: [
          { name: "analytics_readonly", url: "https://www.googleapis.com/auth/analytics.readonly" },
          { name: "analytics", url: "https://www.googleapis.com/auth/analytics" }
        ]
      },
      {
        label: "Google Sheets",
        scopes: [
          { name: "spreadsheets", url: "https://www.googleapis.com/auth/spreadsheets" },
          { name: "spreadsheets_readonly", url: "https://www.googleapis.com/auth/spreadsheets.readonly" }
        ]
      },
      {
        label: "Google Photos",
        scopes: [
          { name: "photoslibrary", url: "https://www.googleapis.com/auth/photoslibrary" },
          { name: "photoslibrary_readonly", url: "https://www.googleapis.com/auth/photoslibrary.readonly" }
        ]
      },
      {
        label: "Google YouTube",
        scopes: [
          { name: "youtube", url: "https://www.googleapis.com/auth/youtube" },
          { name: "youtube_readonly", url: "https://www.googleapis.com/auth/youtube.readonly" },
          { name: "youtube_upload", url: "https://www.googleapis.com/auth/youtube.upload" }
        ]
      },
      {
        label: "Google People API",
        scopes: [
          { name: "userinfo_profile", url: "https://www.googleapis.com/auth/userinfo.profile" },
          { name: "userinfo_email", url: "https://www.googleapis.com/auth/userinfo.email" },
          { name: "profile_agerange_read", url: "https://www.googleapis.com/auth/profile.agerange.read" }
        ]
      },
      {
        label: "Google Ads",
        scopes: [
          { name: "adwords", url: "https://www.googleapis.com/auth/adwords" }
        ]
      },
      {
        label: "Google Classroom",
        scopes: [
          { name: "classroom_courses", url: "https://www.googleapis.com/auth/classroom.courses" },
          { name: "classroom_rosters", url: "https://www.googleapis.com/auth/classroom.rosters" },
          { name: "classroom_coursework_students", url: "https://www.googleapis.com/auth/classroom.coursework.students" }
        ]
      },
      {
        label: "Google Tasks",
        scopes: [
          { name: "tasks", url: "https://www.googleapis.com/auth/tasks" },
          { name: "tasks_readonly", url: "https://www.googleapis.com/auth/tasks.readonly" }
        ]
      },
      {
        label: "Google Maps",
        scopes: [
          { name: "mapsengine", url: "https://www.googleapis.com/auth/mapsengine" },
          { name: "mapsengine_readonly", url: "https://www.googleapis.com/auth/mapsengine.readonly" }
        ]
      }
    ];

    this.toggleScope = function(e) {
      const url = e.target.value;
      if (e.target.checked) {
        this.data.specificData.selectedScopes.push(url);
      } else {
        this.data.specificData.selectedScopes = this.data.specificData.selectedScopes.filter(scope => scope !== url);
      }
      console.log('Selected Scopes:', this.data.specificData.selectedScopes);
      this.update();
    }.bind(this);

    this.handleOAuthRedirect = async function() {
      // Check if scopes are selected
      if (!this.data.specificData.selectedScopes || this.data.specificData.selectedScopes.length === 0) {
        alert('Veuillez sélectionner au moins un scope');
        return;
      }

      const componentId = this.data._id;
      const scopes = this.data.specificData.selectedScopes.join(' ');
      
      try {
        // Save the component data with selected scopes before redirecting
        // This ensures the scopes are available on the server side
        RiotControl.trigger('item_save', this.data);
        
        // Give some time for the save to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error saving component:', error);
      }
      
      const authUrl = `../data/specific/anonymous/google-auth?componentId=${componentId}&scopes=${encodeURIComponent(scopes)}`;
      window.location.href = authUrl;
    }

    this.on('mount', function() {
      RiotControl.on('item_current_changed', this.updateData);
      RiotControl.on('tokens_updated', this.refreshTokens);
    });

    this.on('unmount', function() {
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('tokens_updated', this.refreshTokens);
    });
  </script>
</google-auth-editor>
