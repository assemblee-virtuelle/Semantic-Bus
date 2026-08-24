<admin class="containerV" style="flex-grow:1">

  <!--  boutons des tabs  -->
  <div class="tab">
    <button id="usersBtn" class="tablinks active" onclick={openTab}>Utilisateurs</button>
    <button id="cleanBtn" class="tablinks" onclick={openTab}>Nettoyage</button>
  </div>

  <!--  contenu du tab Utilisateurs  -->
  <div id="users" class="containerV tabcontent" style="flex-grow:1; background-color: rgb(238,242,249);">
    <div class="containerV" style="flex-grow:1;width:90%;align-self:center;">
      <div class="containerTitle">
        <div class="tableTitleName">NOM</div>
        <div class="tableTitleEmail">EMAIL</div>
        <div class="tableTitleRole">ADMIN</div>
        <div class="tableTitleAction">ACTION</div>
      </div>
      <div class="containerV userTableBody">
        <div class="containerH tableRow userRow" each={users}>
          <div class="tableRowName">{name || '-'}</div>
          <div class="tableRowEmail">{credentials.email}</div>
          <div class="tableRowRole">
            <span class={admin? 'admin-badge is-admin' : 'admin-badge'}> {admin? 'admin' : 'user'} </span>
          </div>
          <div class="tableRowAction">
            <button if={!admin} data-user-id={_id} onclick={promoteUser} class="admin-btn promote">Promouvoir admin</button>
            <button if={admin} data-user-id={_id} onclick={demoteUser} class="admin-btn demote">Retirer admin</button>
          </div>
        </div>
      </div>
      <div if={users.length === 0} class="containerH" style="justify-content:center;">
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

    this.refreshData = (data) => {
      this.data = data
      this.update()
    }

    this.refreshUsers = (users) => {
      this.users = users || []
      this.update()
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
      RiotControl.trigger('load_users');
    })

    this.on('unmount', () => {
      RiotControl.off('garbage_cleaned', this.garbageCleaned)
      RiotControl.off('process_cleaned', this.processCleaned)
      RiotControl.off('timers_executed', this.timersExecuted);
      RiotControl.off('users_loaded', this.refreshUsers);
      RiotControl.off('user_admin_changed', this.userAdminChanged);
    })
  </script>
  <style>

    /* Table utilisateurs — colonnes à largeur fixe (alignées header/lignes) */
    .containerTitle,
    .tableRow,
    .tableRowName,
    .tableRowEmail,
    .tableRowRole,
    .tableRowAction,
    .tableTitleName,
    .tableTitleEmail,
    .tableTitleRole,
    .tableTitleAction {
      box-sizing: border-box;
    }
    .tableRowName,
    .tableTitleName {
      flex: 0 0 25%;
      width: 25%;
    }
    .tableRowEmail,
    .tableTitleEmail {
      flex: 0 0 35%;
      width: 35%;
    }
    .tableRowRole,
    .tableTitleRole {
      flex: 0 0 15%;
      width: 15%;
    }
    .tableRowAction,
    .tableTitleAction {
      flex: 0 0 25%;
      width: 25%;
    }

    .tableRowName,
    .tableRowEmail,
    .tableRowRole,
    .tableRowAction {
      font-size: 0.85em;
      padding: 10px;
    }
    .tableRowAction {
      justify-content: flex-end;
    }

    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleName,
    .tableTitleEmail,
    .tableTitleRole,
    .tableTitleAction {
      font-size: 0.85em;
      color: white;
      flex-shrink: 0;
      padding-left: 10px;
    }

    .userTableBody {
      width: 90%;
      background-color: white;
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
  </style>
</admin>