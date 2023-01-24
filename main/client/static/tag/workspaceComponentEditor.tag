<workspace-component-editor class="containerV" style="flex-grow:1;justify-content:center">

  <div class="containerH info" style="background: rgb(213,218,224);flex-wrap:wrap;flex-shrink:0;flex-grow:0;">
    <div class="containerH" style="justify-content:center;">
      <div class="containerV" style="justify-content:center;margin-right:10px;">
        <label>Nom:
        </label>
      </div>
      <div class="containerV" style="justify-content:center;flex-grow:1;">
        <input placeholder="Sans-titre" type="text" id="nameComponentInput" onchange={onNameChange} value={itemCurrent.name} required="required"></input>
      </div>
    </div>

  </div>
    <!--  boutons des tabs  -->
  <div class="tab">
    <button id="generalBtn" class="tablinks active" onclick={openTab}>General</button>
    <div if={showDfTab} class="tablinksContainer">
      <button id="deeperFocusBtn" class="tablinks" onclick={openTab}>DeeperFocus</button>
      <label id="dfSwitchBtn" class="cardInput tablinks" style="justify-content:flex-start;">
        <span class="switch">
          <input type="checkbox" ref="activateDfInput" onchange={activateDfChange} checked={itemCurrent.deeperFocusData.activateDf}>
          <span class="slider round"></span>
        </span>
      </label>
    </div>
  </div>
  <!--  contenu du premier tab  -->
  <div id="general" style="flex-grow:1; background-color: rgb(238,242,249);" class="containerV tabcontent">
    <div id="editionContainer" class="box-flex containerV"></div>
  </div>
  <!--  contenu du deuxième tab  -->
  <div id="deeperFocus" style="flex-grow:1; background-color: rgb(238,242,249); display: none;" class="containerV tabcontent">
    <div class="box-flex containerV">
      <!--  composant deeper focus  -->
      <!-- bouton aide -->
      <div class="contenaireH" style="margin-left:97%">
        <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Deeper-focus" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
      </div>
      <!-- Titre du composant -->
      <div class="contenaireV title-component">Deeper Focus</div>
      <div>
        <div class="bar"/>
      </div>
      <!-- Description du composant -->
      <div class="title-description-component">Début de traitement d'un niveau de profondeur du flux.</div>
      <div>
        <div class="bar"/>
      </div>
      <!-- Champ du composant deeper focus -->
      <label class="labelFormStandard">Chemin à inspecter pour les traitements qui suivent:</label>
      <div class="cardInput">
        <input class="inputComponents" placeholder="vide=racine" type="text" name="dfobPathInput" ref="dfobPathInput" value={itemCurrent.deeperFocusData.dfobPath} onchange={dfobPathChange}></input>
      </div>
      <label class="labelFormStandard">Nombre de traitements parallèles:</label>
      <div class="cardInput">
        <input class="inputComponents" placeholder="" type="text" name="pipeNbInput" ref="pipeNbInput" value={itemCurrent.deeperFocusData.pipeNb} onchange={pipeNbChange}></input>
      </div>
      <label class="labelFormStandard">Le chemin désigne une structure de tableau à conserver en tableau (décomposé en objet par défaut):</label>
      <label class="cardInput">
        <span class="switch">
          <input type="checkbox" ref="keepArrayInput" onchange={keepArrayChange} checked={itemCurrent.deeperFocusData.keepArray}>
          <span class="slider round"></span>
        </span>
      </label>
      <!--  <label class="labelFormStandard">Activation du deeper focus:</label>
        <label class="cardInput">
          <span class="switch">
            <input type="checkbox" ref="activateDfInput" onchange={activateDfChange} checked={itemCurrent.deeperFocusData.activateDf}>
            <span class="slider round"></span>
          </span>
        </label>
      </label>  -->
    </div>
  </div>
  <!--  fin contenu deuxième tab  -->

  <!-- Bouton valider -->
  <div class="containerH" style="flex-basis:45px;justify-content: center;align-items: flex-start; flex-shrink:0;flex-grow:0;">
    <img onclick={saveClick} class="commandButtonImage btnAddSize" src="./image/check.png" title="Valider les paramètres">
  </div>

  <script>
    this.itemCurrent = {};
    this.data = {};
    this.data.deeperFocusData = {};
    this.showDfTab = true;

     // code lié au deeper-focus
    dfobPathChange(e) {
      this.itemCurrent.deeperFocusData.dfobPath = e.target.value;
    }
    pipeNbChange(e) {
      this.itemCurrent.deeperFocusData.pipeNb = e.target.value;
    }
    keepArrayChange(e) {
      this.itemCurrent.deeperFocusData.keepArray = e.target.checked;
    }
    activateDfChange(e) {
      this.itemCurrent.deeperFocusData.activateDf = e.target.checked;
    }
    this.updateData = function (itemCurrent) {
      //if the component is a deeper focus we remove the deeper focus tab added to every component
      if(this.itemCurrent.module == "deeperFocusOpeningBracket" || this.itemCurrent.type == "Deeper Focus"){
        this.showDfTab = false;
      } 
      if(! this.itemCurrent.deeperFocusData) {
        this.itemCurrent.deeperFocusData = {};
      }
      this.refs.dfobPathInput.dfobPath = this.itemCurrent.deeperFocusData.dfobPath;
      this.refs.pipeNbInput.pipeNb = this.itemCurrent.deeperFocusData.pipeNb;
      this.refs.keepArrayInput.keepArray = this.itemCurrent.deeperFocusData.keepArray;
      this.refs.activateDfInput.activateDf = this.itemCurrent.deeperFocusData.activateDf;
      this.update();
    }.bind(this);
    // fin du code lié au deeper focus
    
    onNameChange(e) {
      this.itemCurrent.name = e.target.value;
    }

    this.saveClick = function (e) {
      RiotControl.trigger('item_current_persist');
    }

    this.mountEdition = function (editor) {
      this.editionContainer = riot.mount('#editionContainer', editor)[0];
    };

    this.itemCurrentEditorChanged = function (editor) {
      //console.log('editor',editor);
      this.mountEdition(editor);
      this.update();
    }.bind(this);

    this.itemCurrentChanged = function (item) {
      //console.log('item',item);
      this.itemCurrent = item;
      this.updateData(item);
      this.update();
    }.bind(this);

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

      id = e.srcElement.id.replace('Btn','');
      document.getElementById(id).style.display = "flex";

      e.currentTarget.className += " active";
      document.getElementById("dfSwitchBtn").className 
    }

    this.on('mount', function () {
      RiotControl.trigger('workspace_current_refresh');
      RiotControl.on('item_current_changed', this.itemCurrentChanged);
      RiotControl.on('item_current_editor_changed', this.itemCurrentEditorChanged);
      RiotControl.trigger('component_current_refresh');
    });

    this.on('unmount', function () {
      this.editionContainer.unmount();
      RiotControl.off('item_current_changed', this.itemCurrentChanged);
      RiotControl.off('item_current_editor_changed', this.itemCurrentEditorChanged);
    })
  </script>
  <style>
    .info {
      justify-content: flex-start;
      flex-shrink: 0;

    }
    .info > div {
      padding: 10px;
      flex-grow: 1;
    }

  </style>

</workspace-component-editor>
