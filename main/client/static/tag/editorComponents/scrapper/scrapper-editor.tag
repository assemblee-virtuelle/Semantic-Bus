<scrapper-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Scrapper" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Scrapper</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">Scrapper une page HTLM.</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>

  <label class="labelFormStandard">User ( Sauce Lab )</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="user" value={data.specificData.user}></input>
  </div>
  <label class="labelFormStandard">Key ( Sauce Lab )</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="key" value={data.specificData.key}></input>
  </div>
  <label class="labelFormStandard">Name of Sauce Labs JOB</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="saucelabname" value={data.specificData.saucelabname}></input>
  </div>
  <label class="labelFormStandard">URL</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder="" type="text" ref="url" value={data.specificData.url}></input>
  </div>
  <!-- tableau scrapper -->
  <label class="labelFormStandard">Ajouter un Scénario</label>
  <div class="cardInput">
    <image class="commandButtonImage btnAddSize" placeholder="Nouveau Scénario" src="./image/ajout_composant.svg" onclick={addRowClick}></image>
  </div>
  <div>
    <zentable ref="scrapperRef" style="flex:1" drag={true} allowdirectedit={true} disallowselect={true} disallownavigation={true}>
      <yield to="header">
        <div class="containerTitle">
          <div class="tableTitleAction">Action</div>
          <div class="tableTitleName">Nom</div>
          <div class="tableTitleSelection">Selection</div>
          <div class="tableTitleAttr">Attribut</div>
          <div class="tableTitleValue">Valeur</div>
          <div class="tableTitleX">X</div>
          <div class="tableTitleY">Y</div>
          <div class="tableEmpty"/>
        </div>
      </yield>
      <yield to="row">
        <div class="containerRowScrapper">
          <div class="tableRowAction">
            <select style="width: 90%; height: 70%;" data-field="actionType" ref="actionType">
              <option each={optionValue in [" " , "getValue" , "getHtml" , "getAttr" , "setValue" , "click" , "scroll" ,"selectByValue","wait" ]} value={optionValue} selected={actionType==optionValue}>{optionValue}</option>
            </select>
          </div>
          <div class="tableRowName">
            <input style="width: 90%; padding: 0.7vh;" type="text" placeholder="Nom"value={action} data-field="action"/>
          </div>
          <div class="tableRowSelection">
            <input style="width: 90%; padding: 0.7vh;" type="text" placeholder="Selection"value={selector} data-field="selector"/>
          </div>
          <div class="tableRowAttr">
            <input style="width: 90%; padding: 0.7vh;" type="text" placeholder="Attribut"value={attribut} data-field="attribut"/>
          </div>
          <div class="tableRowValue">
            <input style="width: 90%; padding: 0.7vh;" type="text" placeholder="Valeur"value={setValue} data-field="setValue"/>
          </div>
          <div class="tableRowX">
            <input style="width: 90%; padding: 0.7vh;" type="text" placeholder="X"value={scrollX} data-field="scrollX"/>
          </div>
          <div class="tableRowY">
            <input style="width: 90%; padding: 0.7vh;" type="text" placeholder="Y"value={scrollY} data-field="scrollY"/>
          </div>
        
        </div>
      </yield>
    </zentable>
  </div>

  <style>
    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleAction {
      font-size: 0.85em;
      flex:0.1275;
      color: white;
      text-transform: uppercase;
      text-align: center;
      
      text-align: center;
    }
    .tableTitleName {
      font-size: 0.85em;
      flex:0.17;
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
    .tableTitleSelection {
      font-size: 0.85em;
      flex:0.17;
      color: white;
      text-transform: uppercase;
      text-align: center;

    }
    .tableTitleAttr {
      font-size: 0.85em;
      flex:0.17;
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
    .tableTitleValue {
      font-size: 0.85em;
      flex:0.1275;
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
    .tableTitleX {
      font-size: 0.85em;
      flex:0.0425;
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
    .tableTitleY {
      font-size: 0.85em;
      flex:0.0425;
      color: white;
      text-transform: uppercase;
      text-align: center;
    }
    .tableEmpty {
      flex:0.15;
    }


    .containerRowScrapper {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1
    }
    .tableRowAction {
      font-size: 0.85em;
      flex:0.15;
      justify-content: center;
      align-items: center;
      display: flex;
      height: 100%;
    }
    .tableRowName {
      font-size: 0.85em;
      flex:0.2;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .tableRowSelection {
      font-size: 0.85em;
      flex:0.2;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .tableRowAttr {
      font-size: 0.85em;
      flex:0.2;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .tableRowValue {
      font-size: 0.85em;
      flex:0.15;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .tableRowX {
      font-size: 0.85em;
      flex:0.05;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .tableRowY {
      font-size: 0.85em;
      flex:0.05;
      margin-left: 5px;
      justify-content: center;
      align-items: center;
      display: flex;
    }

    .form-controle {
      display: block;
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.25;
      color: #464a4c;
      background-color: #fff;
      background-image: none;
      -webkit-background-clip: padding-box;
      background-clip: padding-box;
      border: 1px solid rgba(0,0,0,.15);
      border-radius: 0.25rem;
      -webkit-transition: border-color ease-in-out 0.15s,-webkit-box-shadow ease-in-out 0.15s;
      transition: border-color ease-in-out 0.15s,-webkit-box-shadow ease-in-out 0.15s;
      -o-transition: border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;
      transition: border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;
      transition: border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s,-webkit-box-shadow ease-in-out 0.15s;
    }

    .hide {
      display: none;
    }

    .display {
      display: block;
    }
    [type="checkbox"]:checked + label:before,
    [type="checkbox"]:not(:checked) + label:before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      width: 17px;
      height: 17px;
      /* dim. de la case */
      border: 1px solid #aaa;
      background: #f8f8f8;
      border-radius: 3px;
      /* légère ombre interne */
      /* angles arrondis */
      box-shadow: inset 0 1px 3px rgba(0,0,0,.3);
    }
  </style>

  <script>

    //initialize
    this.currentRowId = undefined;
    this.getAttr = false
    this.setValue = false
    this.scroll = false
    this.data = {};
    this.data.specificData = {};

    addRowClick(e) {
      //var index=parseInt(e.currentTarget.dataset.rowid) console.log(index);
      this.refs.scrapperRef.data.push({})
    }

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.refs.scrapperRef.data = this.data.specificData.scrapperRef || [];
      this.update();
    }.bind(this);

    // recalculateHeader() {   var headers = this.refs.scrapperRef.refs.tableHeader.children;   console.log("HEADER", headers)   for (var row of this.root.querySelectorAll('.tableRow')) {     for (var headerkey in headers) {       var numkey =
    // parseInt(headerkey);       if (!isNaN(numkey)) {         console.log(row.children[numkey].getBoundingClientRect().width);         var width = row.children[numkey].getBoundingClientRect().width;         var cssWidth = width + 'px';
    // headers[headerkey].style.width = cssWidth ;         headers[headerkey].style.maxWidth = cssWidth ;         headers[headerkey].style.minWidth = cssWidth ;         headers[headerkey].style.flexBasis = cssWidth ;
    // console.log(headers[headerkey].style);       }     }     break;   } }

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });

    this.on('mount', function () {
      //this.recalculateHeader()
      RiotControl.on('item_current_changed', this.updateData);

      // this.refs.scrapperRef.on('onValueChange', (data) => {
      //
      // });

      this.refs.scrapperRef.on('dataChanged', data => {
        this.data.specificData.scrapperRef = data;
      });

      this.refs.scrapperRef.on('delRow', (row) => {
        //console.log(row);
        this.refs.scrapperRef.data.splice(row.rowId, 1);
      });

      RiotControl.on('item_current_changed', this.updateData);

      this.refs.url.addEventListener('change', function (e) {
        //this.url = e.currentTarget.value;
        this.data.specificData.url = e.currentTarget.value;
        //console.log(this.data.specificData)
      }.bind(this));

      this.refs.user.addEventListener('change', function (e) {
        //this.user = e.target.value;
        this.data.specificData.user = e.currentTarget.value;
      }.bind(this));

      this.refs.key.addEventListener('change', function (e) {
        //this.key = e.target.value;
        this.data.specificData.key = e.currentTarget.value;
      }.bind(this));

      this.refs.saucelabname.addEventListener('change', function (e) {
        //this.key = e.target.value;
        this.data.specificData.saucelabname = e.currentTarget.value;
      }.bind(this));

    });
  </script>
</scrapper-editor>
