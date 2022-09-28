<sftp-consumer-editor>
  <!-- bouton aide -->
  <div class="containerH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-sftp-consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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

  <label class="labelFormStandard">host:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="hostInput" onchange={changeHost} value={data.specificData.host}></input>
  </div>
  <label class="labelFormStandard">port:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="portInput" onchange={changePort} value={data.specificData.port}></input>
  </div>
  <label class="labelFormStandard">login:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="loginInput" onchange={changeLogin} value={data.specificData.login}></input>
  </div>
  <label class="labelFormStandard">password:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="passwordInput" onchange={changePassword} value={data.specificData.password}></input>
  </div>
  <label class="labelFormStandard">path:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="pathInput" onchange={changePath} value={data.specificData.path}></input>
  </div>

  <script>
    this.data = {}
    this.data.specificData = {}
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate
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
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
    }.bind(this));

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</sftp-consumer-editor>
