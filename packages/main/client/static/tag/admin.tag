<admin class="containerV" style="flex-grow:1">

  <!--  boutons des tabs  -->
  <div class="tab">
    <button id="usersBtn" class="tablinks active" onclick={openTab}>Utilisateurs</button>
    <button id="cleanBtn" class="tablinks" onclick={openTab}>Nettoyage</button>
  </div>

  <!--  contenu du tab Utilisateurs  -->
  <div id="users" class="containerV tabcontent" style="flex-grow:1; background-color: rgb(238,242,249);">
    <div class="containerV" style="flex-grow:1;width:95%;align-self:center;min-height:0;overflow-y:auto;">
      <div class="containerTitle">
        <div class="tableTitleName sortable" data-sort="name" onclick={sortBy}>NOM {sortArrow('name')}</div>
        <div class="tableTitleEmail sortable" data-sort="email" onclick={sortBy}>EMAIL {sortArrow('email')}</div>
        <div class="tableTitleRole sortable" data-sort="admin" onclick={sortBy}>ADMIN {sortArrow('admin')}</div>
        <div class="tableTitleCount sortable" data-sort="workspaceCount" onclick={sortBy}>OWNER {sortArrow('workspaceCount')}</div>
        <div class="tableTitleCount sortable" data-sort="contributorCount" onclick={sortBy}>CONTRIBUTEUR {sortArrow('contributorCount')}</div>
        <div class="tableTitleDate sortable" data-sort="createdAt" onclick={sortBy}>INSCRIPTION {sortArrow('createdAt')}</div>
        <div class="tableTitleDate sortable" data-sort="lastLogin" onclick={sortBy}>DERNIÈRE CONNEXION {sortArrow('lastLogin')}</div>
        <div class="tableTitleDate sortable" data-sort="lastExecution" onclick={sortBy}>DERNIÈRE EXÉCUTION {sortArrow('lastExecution')}</div>
        <div class="tableTitleAction">ACTION</div>
      </div>
      <div class="containerV userTableBody">
        <div class="containerV userRowBlock" each={displayUsers}>
          <div class="containerH tableRow userRow">
            <div class="tableRowName">{name || '-'}</div>
            <div class="tableRowEmail">{email}</div>
            <div class="tableRowRole">
              <span class={admin? 'admin-badge is-admin' : 'admin-badge'}> {admin? 'admin' : 'user'} </span>
            </div>
            <div class="tableRowCount">{workspaceCount}</div>
            <div class="tableRowCount">{contributorCount}</div>
            <div class="tableRowDate">{formatDate(createdAt)}</div>
            <div class="tableRowDate">{formatDate(lastLogin)}</div>
            <div class="tableRowDate">{formatDate(lastExecution)}</div>
            <div class="tableRowAction">
              <button data-user-id={_id} onclick={toggleWorkflows} class="admin-btn details">Détails</button>
              <button if={!admin} data-user-id={_id} onclick={promoteUser} class="admin-btn promote">Promouvoir</button>
              <button if={admin} data-user-id={_id} onclick={demoteUser} class="admin-btn demote">Retirer</button>
            </div>
          </div>
          <div if={expandedId === _id} class="containerV userWorkflowDetail">
            <div class="containerV workflowDetailInner">
              <div if={userWorkflows.length === 0} class="workflowEmpty">Aucun workflow.</div>
              <div class="containerH workflowRow workflowHeader">
                <div class="wfCol wfName">NOM</div>
                <div class="wfCol wfRole">RÔLE</div>
                <div class="wfCol wfLast">DERNIÈRE EXÉCUTION</div>
                <div class="wfCol wfAction">OUVRIR</div>
              </div>
              <div class="containerH workflowRow" each={userWorkflows}>
                <div class="wfCol wfName">{name}</div>
                <div class="wfCol wfRole">
                  <span class={isOwner? 'wf-badge is-owner' : 'wf-badge is-contributor'}> {isOwner? 'owner' : 'contributeur'} </span>
                </div>
                <div class="wfCol wfLast">{formatDate(lastExecution)}</div>
                <div class="wfCol wfAction">
                  <a href={'application.html#workspace/' + _id + '/component'} target="_blank" class="wf-open">Ouvrir ↗</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div if={displayUsers.length === 0} class="containerH" style="justify-content:center;">
        <div class="containerV" style="flex-basis:1;justify-content:center;margin:50px">
          <h1 style="text-align: center;color: rgb(119,119,119);">Aucun utilisateur.</h1>
        </div>
      </div>
    </div>
  </div>

  <!--  contenu du tab Nettoyage  -->
  <div id="clean" class="containerV tabcontent" style="flex-grow:1; background-color: rgb(238,242,249); display: none;">
    <div class="containerV box-flex" style="flex-grow:1;">
      <div class="containerH admin-clean-item">
        <div class="containerV admin-clean-info">
          <span class="admin-clean-title">Nettoyer les fragments</span>
          <span class="admin-clean-desc">Supprimer les fragments marqués à supprimer.</span>
        </div>
        <button class="admin-clean-btn" onclick={cleanGarbageSimpleClick}>Nettoyer</button>
      </div>

      <div class="containerH admin-clean-item">
        <div class="containerV admin-clean-info">
          <span class="admin-clean-title">Nettoyer processus + fragments</span>
          <span class="admin-clean-desc">Supprimer les processus d'exécution périmés puis marquer et supprimer les fragments associés.</span>
        </div>
        <button class="admin-clean-btn" onclick={cleanProcessClick}>Nettoyer</button>
      </div>

      <div class="containerH admin-clean-item">
        <div class="containerV admin-clean-info">
          <span class="admin-clean-title">Nettoyage brutal</span>
          <span class="admin-clean-desc">Supprimer brutalement (algorithme indépendant) les fragments des processus périmés.</span>
        </div>
        <button class="admin-clean-btn danger" onclick={cleanGarbageClick}>Nettoyer</button>
      </div>

      <div class="containerH admin-clean-item">
        <div class="containerV admin-clean-info">
          <span class="admin-clean-title">Exécuter tous les timers</span>
          <span class="admin-clean-desc">Déclencher immédiatement l'exécution de tous les timers planifiés.</span>
        </div>
        <button class="admin-clean-btn" onclick={executeTimersClick}>Exécuter</button>
      </div>
    </div>
  </div>

  <script>
    this.data = {}
    this.users = []
    this.displayUsers = []
    this.sortKey = null
    this.sortAsc = true
    this.expandedId = null
    this.userWorkflows = []

    this.refreshData = (data) => {
      this.data = data
      this.update()
    }

    this.toggleWorkflows = (e) => {
      const userId = (e && e.currentTarget && e.currentTarget.getAttribute('data-user-id'))
      if (this.expandedId === userId) {
        this.expandedId = null
        this.userWorkflows = []
        this.update()
      } else {
        this.expandedId = userId
        this.userWorkflows = []
        RiotControl.trigger('load_user_workflows', userId)
        this.update()
      }
    }

    this.userWorkflowsLoaded = (data) => {
      if (data && data.userId === this.expandedId) {
        this.userWorkflows = data.workflows || []
        this.update()
      }
    }

    this.refreshUsers = (users) => {
      this.users = users || []
      this.computeDisplay()
      this.update()
    }

    this.computeDisplay = () => {
      if (!this.sortKey) {
        this.displayUsers = this.users
      } else {
        this.displayUsers = this.users.slice().sort((a, b) => {
          let va = a[this.sortKey]
          let vb = b[this.sortKey]
          if (va === null || va === undefined) va = ''
          if (vb === null || vb === undefined) vb = ''
          if (typeof va === 'number' && typeof vb === 'number') {
            return this.sortAsc ? va - vb : vb - va
          }
          va = String(va)
          vb = String(vb)
          return this.sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
        })
      }
    }

    this.sortBy = (e) => {
      const key = e.currentTarget.getAttribute('data-sort')
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc
      } else {
        this.sortKey = key
        this.sortAsc = true
      }
      this.computeDisplay()
      this.update()
    }

    this.sortArrow = (key) => {
      if (this.sortKey !== key) return ''
      return this.sortAsc ? '▲' : '▼'
    }

    this.formatDate = (d) => {
      if (!d) return '-'
      const date = new Date(d)
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      return `${dd}/${mm}/${date.getFullYear()}`
    }

    this.promoteUser = (e) => {
      const userId = (e && e.item && e.item._id) || (e && e.currentTarget && e.currentTarget.getAttribute('data-user-id'))
      RiotControl.trigger('set_user_admin', userId, true)
    }

    this.demoteUser = (e) => {
      const userId = (e && e.item && e.item._id) || (e && e.currentTarget && e.currentTarget.getAttribute('data-user-id'))
      RiotControl.trigger('set_user_admin', userId, false)
    }

    this.userAdminChanged = (data) => {
      if (data && data.user) {
        for (u of this.users) {
          if (u._id == data.user._id) {
            u.admin = data.admin
          }
        }
        this.computeDisplay()
        this.update()
      }
    }

    openTab(e) {
      var i, tabcontent, tablinks, id;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
      }

      id = e.srcElement.id.replace('Btn', '');
      document.getElementById(id).style.display = "flex";
      e.currentTarget.className += " active";
    }

    cleanGarbageClick(e) {
      RiotControl.trigger('clean_garbage');
    }

    cleanProcessClick(e) {
      RiotControl.trigger('clean_process');
    }

    cleanGarbageSimpleClick(e) {
      RiotControl.trigger('clean_garbage_simple');
    }

    executeTimersClick(e) {
      RiotControl.trigger('execute_timers');
    }

    garbageCleaned() {
      alert('données perimées néttoyés');
    }

    processCleaned() {
      alert('processus néttoyés');
    }

    timersExecuted() {
      alert('timers executés');
    }

    this.on('mount', () => {
      RiotControl.on('garbage_cleaned', this.garbageCleaned);
      RiotControl.on('process_cleaned', this.processCleaned);
      RiotControl.on('timers_executed', this.timersExecuted);
      RiotControl.on('users_loaded', this.refreshUsers);
      RiotControl.on('user_admin_changed', this.userAdminChanged);
      RiotControl.on('user_workflows_loaded', this.userWorkflowsLoaded);
      RiotControl.trigger('load_users');
    })

    this.on('unmount', () => {
      RiotControl.off('garbage_cleaned', this.garbageCleaned)
      RiotControl.off('process_cleaned', this.processCleaned)
      RiotControl.off('timers_executed', this.timersExecuted);
      RiotControl.off('users_loaded', this.refreshUsers);
      RiotControl.off('user_admin_changed', this.userAdminChanged);
      RiotControl.off('user_workflows_loaded', this.userWorkflowsLoaded);
    })
  </script>
  <style>

    /* Bandeau d'onglets : hauteur fixe, non compressible quand la liste est longue */
    .tab {
      flex-shrink: 0;
      height: 48px;
      min-height: 48px;
      align-items: center;
    }
    .tab button {
      padding: 12px 18px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tabcontent {
      overflow-y: auto;
      min-height: 0;
    }

    /* Les lignes de users ne doivent jamais être compressées (hauteur fine/invisible)
       quand la liste est longue : le tabcontent scroll, les lignes gardent leur taille.
       NB : flex.css impose .containerV>.containerV { flex-shrink:1 } — il faut !important. */
    .userRowBlock {
      flex-shrink: 0 !important;
    }
    .userRowBlock > .userRow {
      flex-shrink: 0 !important;
    }
    .userTableBody {
      flex-shrink: 0 !important;
    }

    /* Table utilisateurs — colonnes à largeur fixe (alignées header/lignes) */
    .containerTitle,
    .tableRow,
    .tableRowName,
    .tableRowEmail,
    .tableRowRole,
    .tableRowAction,
    .tableRowCount,
    .tableRowDate,
    .tableTitleName,
    .tableTitleEmail,
    .tableTitleRole,
    .tableTitleAction,
    .tableTitleCount,
    .tableTitleDate {
      box-sizing: border-box;
    }
    .tableRowName,
    .tableTitleName {
      flex: 0 0 14%;
      width: 14%;
    }
    .tableRowEmail,
    .tableTitleEmail {
      flex: 0 0 16%;
      width: 16%;
    }
    .tableRowRole,
    .tableTitleRole {
      flex: 0 0 7%;
      width: 7%;
    }
    .tableRowCount,
    .tableTitleCount {
      flex: 0 0 8%;
      width: 8%;
    }
    .tableRowDate,
    .tableTitleDate {
      flex: 0 0 10%;
      width: 10%;
    }
    .tableRowAction,
    .tableTitleAction {
      flex: 0 0 12%;
      width: 12%;
    }

    .tableRowName,
    .tableRowEmail,
    .tableRowRole,
    .tableRowCount,
    .tableRowDate,
    .tableRowAction {
      font-size: 0.85em;
      padding: 10px;
    }
    .tableRowCount {
      text-align: center;
    }
    .tableRowAction {
      justify-content: flex-end;
    }

    .containerTitle {
      border-radius: 2px;
      width: 95%;
      flex-direction: row;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleName,
    .tableTitleEmail,
    .tableTitleRole,
    .tableTitleCount,
    .tableTitleDate,
    .tableTitleAction {
      font-size: 0.85em;
      color: white;
      flex-shrink: 0;
      padding-left: 10px;
    }
    .tableTitleName.sortable,
    .tableTitleEmail.sortable,
    .tableTitleRole.sortable,
    .tableTitleCount.sortable,
    .tableTitleDate.sortable {
      cursor: pointer;
    }
    .tableTitleName.sortable:hover,
    .tableTitleEmail.sortable:hover,
    .tableTitleRole.sortable:hover,
    .tableTitleCount.sortable:hover,
    .tableTitleDate.sortable:hover {
      text-decoration: underline;
    }

    .userTableBody {
      width: 95%;
      background-color: white;
      overflow: visible;
      min-height: 0;
    }
    .userRow {
      border-bottom: 1px solid #f2f3f5;
      align-items: center;
    }

    .admin-clean-item {
      align-items: center;
      padding: 14px 10px;
      border-bottom: 1px solid #f2f3f5;
    }
    .admin-clean-info {
      flex: 1;
      align-items: flex-start;
    }
    .admin-clean-title {
      font-size: 0.95em;
      color: rgb(40,50,60);
    }
    .admin-clean-desc {
      font-size: 0.8em;
      color: rgb(140,150,160);
      margin-top: 2px;
    }
    .admin-clean-btn {
      border: none;
      border-radius: 4px;
      background-color: rgb(26,145,194);
      color: white;
      padding: 8px 18px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .admin-clean-btn:hover {
      background-color: rgb(20,120,165);
    }
    .admin-clean-btn.danger {
      background-color: #ff6f69;
    }
    .admin-clean-btn.danger:hover {
      background-color: #e55a54;
    }

    .admin-badge {
      padding: 3px 10px;
      border-radius: 10px;
      color: white;
      font-size: 0.75em;
      text-transform: uppercase;
    }
    .admin-badge.is-admin {
      background-color: #88d8b0;
    }
    .admin-badge:not(.is-admin) {
      background-color: rgb(170,180,190);
    }

    .admin-btn {
      border: none;
      border-radius: 4px;
      color: white;
      padding: 6px 14px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .admin-btn.promote {
      background-color: rgb(26,145,194);
    }
    .admin-btn.promote:hover {
      background-color: rgb(20,120,165);
    }
    .admin-btn.demote {
      background-color: #ff6f69;
    }
    .admin-btn.demote:hover {
      background-color: #e55a54;
    }
    .admin-btn.details {
      background-color: rgb(90,150,190);
    }
    .admin-btn.details:hover {
      background-color: rgb(70,130,170);
    }

    /* Accordéon détail des workflows d'un user */
    .userWorkflowDetail {
      width: 100%;
      background-color: rgb(244,247,250);
      border-left: 3px solid rgb(26,145,194);
    }
    .workflowDetailInner {
      width: 100%;
      padding: 12px 20px;
    }
    .workflowEmpty {
      color: rgb(140,150,160);
      font-size: 0.9em;
      padding: 8px 0;
    }
    .workflowRow {
      width: 100%;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #e4e9ef;
    }
    .workflowHeader {
      font-weight: 600;
      color: rgb(80,90,100);
      font-size: 0.8em;
      text-transform: uppercase;
    }
    .wfCol {
      font-size: 0.85em;
      padding: 0 8px;
    }
    .wfName { flex: 0 0 40%; width: 40%; }
    .wfRole { flex: 0 0 20%; width: 20%; }
    .wfLast { flex: 0 0 25%; width: 25%; }
    .wfAction { flex: 0 0 15%; width: 15%; }
    .wf-badge {
      padding: 3px 10px;
      border-radius: 10px;
      color: white;
      font-size: 0.75em;
      text-transform: uppercase;
    }
    .wf-badge.is-owner { background-color: rgb(26,145,194); }
    .wf-badge.is-contributor { background-color: rgb(170,180,190); }
    .wf-open {
      color: rgb(26,145,194);
      text-decoration: none;
      font-size: 0.85em;
    }
    .wf-open:hover {
      text-decoration: underline;
    }
  </style>
</admin>