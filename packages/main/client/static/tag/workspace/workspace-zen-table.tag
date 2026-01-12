<workspace-zen-table class="containerV" style="flex-grow:1">
  <div class="containerH containerSearch">
    <div class="search-wrapper">
      <input
        class="searchbox inputStandard"
        type="text"
        name="inputSearch"
        ref="inputSearch"
        placeholder="Recherche par nom..."
        oninput={updateSearch}
      />
      <input
        class="searchbox inputStandard"
        type="text"
        name="inputSearchUrl"
        ref="inputSearchUrl"
        placeholder="Recherche par URL de provider..."
        oninput={updateSearchUrl}
      />
    </div>
  </div>

  <zenTable ref="zentable" show={filteredData.length > 0} drag={false} disallowselect={true} disallowdelete={opts.disallowdelete}>
    <yield to="header">
      <div class="containerTitle">
        <div class="tableTitleName">STATUT</div>
        <div class="tableTitleName">NOM</div>
        <div class="tableTitleDescription">DESCRIPTION</div>
        <div class="tableTitleName">RÔLE</div>
        <div class="tableTitleDate">DATE DE MODIFICATION</div>
        <div class="tableEmpty"/>
      </div>
    </yield>
    <yield to="row">
      <div class="tableRowStatus">
        <div class={status}>
          <div class="img-status-div">
            <img src={"./image/"+status+".svg"} class="img-status" style="width:1.2em"/>
          </div>
          <div class="status-div">
            {status}
          </div>
        </div>
      </div>
      <div class="tableRowName">{name}</div>
      <div class="tableRowDescription">{description.slice(0,20)}</div>
      <div class="tableRowName">{role}</div>
      <div class="tableRowDate">{updatedAt? renderDate(updatedAt): '' }</div>
    </yield>
  </zenTable>

  <div if={filteredData.length === 0} class="containerH" style="flex-grow:1;justify-content:center;">
    <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">
      <h1 style="text-align: center;color: rgb(119,119,119);">
        { opts.emptyText }
      </h1>
    </div>
  </div>

  <script>
    renderDate = (date) => (
      `${new Date(date).getDate()} ${['janv.',
        'févr.',
        'mars',
        'avr.',
        'mai',
        'juin',
        'juil.',
        'août',
        'sept.',
        'oct.',
        'nov.',
        'dec.'][new Date(date).getMonth()]} ${new Date(date).getFullYear()}`
    )
    this.filter = ''
    this.providerUrlFilter = ''
    this.filteredData = []
    this.providerLinks = {}
    this.matchingProviderWorkspaces = []

    this.reload = () => {
      this.filteredData = this.filterData(this.opts.data)
      this.refs.zentable.data = this.filteredData
    }

    // Helper function to normalize URL for comparison
    this.normalizeProviderUrl = (url) => {
      if (!url) return null;
      
      // Extract path from full URL (e.g., /data/api/xxx-out)
      const fullUrlPattern = /^https?:\/\/[^\/]+(\/data\/api\/[^?#]+)/;
      const fullMatch = url.match(fullUrlPattern);
      if (fullMatch) {
        return fullMatch[1];
      }
      
      // If it starts with /data/api/, return as is
      if (url.startsWith('/data/api/')) {
        return url;
      }
      
      // If it's just the component identifier (e.g., "696518bec4d126b4fab958cb-out")
      if (!url.includes('/')) {
        return '/data/api/' + url;
      }
      
      return url;
    }

    // Find workspaces that have a provider matching the given URL
    this.findWorkspacesWithProviderUrl = (searchUrl) => {
      if (!searchUrl || !this.providerLinks) return [];
      
      const normalizedSearchUrl = this.normalizeProviderUrl(searchUrl);
      if (!normalizedSearchUrl) return [];
      
      const matchingWorkspaceIds = [];
      
      // providerLinks is: { providerId -> [consumers] }
      // We need to find providers whose URL matches, then get their workspaceId
      // But providerLinks doesn't contain the provider URL...
      // We need to use a different approach: search in providerByPath from backend
      
      // Actually, we need to request the full http-links data with URL info
      // For now, let's check if any provider in providerLinks has consumers
      // and match by looking at the stored data
      
      // Better approach: store provider info when loading http_links
      if (this.providersByUrl) {
        for (const [path, providerInfo] of Object.entries(this.providersByUrl)) {
          if (path === normalizedSearchUrl || 
              providerInfo.originalUrl === searchUrl ||
              providerInfo.originalUrl.includes(searchUrl.replace(/^https?:\/\/[^\/]+/, ''))) {
            matchingWorkspaceIds.push(providerInfo.workspaceId);
          }
        }
      }
      
      return matchingWorkspaceIds;
    }

    this.filterData = (data) => {
      let result = data;
      
      // Filter by name
      if (this.filter !== undefined && this.filter !== null && this.filter !== '') {
        result = sift(
          { name: { $regex: new RegExp(this.filter, 'i') } },
          result
        )
      }
      
      // Filter by provider URL
      if (this.providerUrlFilter !== undefined && this.providerUrlFilter !== null && this.providerUrlFilter !== '') {
        if (this.matchingProviderWorkspaces.length > 0) {
          result = result.filter(workspace => 
            this.matchingProviderWorkspaces.includes(workspace._id)
          );
        } else {
          // If URL filter is set but no matches, return empty
          result = [];
        }
      }
      
      return result;
    }

    this.updateSearch = (event) => {
      this.filter = event.target.value
      this.reload()
    }

    this.updateSearchUrl = (event) => {
      this.providerUrlFilter = event.target.value
      
      if (this.providerUrlFilter) {
        // Search for matching providers
        this.matchingProviderWorkspaces = this.findWorkspacesWithProviderUrl(this.providerUrlFilter);
      } else {
        this.matchingProviderWorkspaces = [];
      }
      
      this.reload()
      this.update()
    }

    this.onHttpLinksLoaded = (data) => {
      this.providerLinks = data.providerLinks || {};
      // Build a map of provider URLs to workspace info
      // We need to fetch this from the raw data
      this.reload();
      this.update();
    }

    this.on('mount', () => {
      this.reload()
      // this.tags.zentable.on('rowNavigation', (data) => route('workspace/' + data._id + '/component'))
      this.refs.zentable.on('rowNavigation', (data) => this.trigger('rowNavigation',data))
      this.refs.zentable.on('delRow', (data) => {
        //console.log('delRow workspace-zen-table', data)
        this.trigger('delRow', data)
      })

      // Listen for http links data
      RiotControl.on('http_links_loaded', this.onHttpLinksLoaded);
      RiotControl.on('http_links_providers_by_url', this.onProvidersbyUrlLoaded);
      
      // Request providers by URL data
      RiotControl.trigger('http_links_load');
      RiotControl.trigger('http_links_get_providers_by_url');

      this.update()
    })

    this.onProvidersbyUrlLoaded = (data) => {
      this.providersByUrl = data || {};
      if (this.providerUrlFilter) {
        this.matchingProviderWorkspaces = this.findWorkspacesWithProviderUrl(this.providerUrlFilter);
        this.reload();
        this.update();
      }
    }

    this.on('unmount', () => {
      RiotControl.off('http_links_loaded', this.onHttpLinksLoaded);
      RiotControl.off('http_links_providers_by_url', this.onProvidersbyUrlLoaded);
    })

    this.on('update', () => {
      this.reload()
    })
  </script>

  <style>
    .img-status {
      width:1em
    }
    .img-status-div {
      flex: 0.2;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .status-div {
      font-size:0.85em;
      flex: 0.8;
      justify-content: center;
      align-items: center;
      display: flex;
    }

    .containerSearch {
      height: 80px;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
    }
    
    .search-wrapper {
      display: flex;
      gap: 20px;
      width: 90%;
      max-width: 900px;
    }
    
    .search-wrapper .searchbox {
      flex: 1;
    }
    ::placeholder{
      color: rgb(200,200,200);
      font-style: italic;
      opacity: 1; /* Firefox */
    }

    .tableRowStatus {
      font-size: 0.85em;
      flex:0.25;
      padding: 10px;
    }
    .tableRowName {
      font-size: 0.85em;
      flex:0.3;
      padding: 10px;
    }
    .tableRowDescription {
      font-size: 0.85em;
      flex:0.35;
      padding: 10px;
    }
    .tableRowDate {
      font-size: 0.85em;
      flex:0.2;
      padding: 10px;
    }

    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleName {
      font-size: 0.85em;
      flex:0.255;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableTitleDescription {
      font-size: 0.85em;
      flex:0.340;
      color: white;
      flex-shrink: 0;
      padding-left:10px;
    }
    .tableTitleDate {
      font-size: 0.85em;
      flex:0.255;
      color: white;
      flex-shrink: 0;
    }
    .tableEmpty {
      flex:0.15;
    }
    .no-start {
      background-color: rgb(200,200,200);
      border-radius: 5px;
      padding: 5px;
      width: 50%;
      color: white;
      text-transform: uppercase;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .stoped {
      background-color: #ff6f69;
      border-radius: 5px;
      padding: 5px;
      width: 50%;
      color: white;
      text-transform: uppercase;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .running {
      background-color: #ffcc5c;
      border-radius: 5px;
      padding: 5px;
      width: 50%;
      color: white;
      text-transform: uppercase;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .error {
      background-color: #ff6f69;
      border-radius: 5px;
      padding: 5px;
      width: 50%;
      color: white;
      text-transform: uppercase;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .resolved {
      justify-content: space-around;
      background-color: #88d8b0;
      border-radius: 5px;
      padding: 5px;
      width: 50%;
      color: white;
      text-transform: uppercase;
      align-items: center;
      display: flex;
    }
  </style>
</workspace-zen-table>
