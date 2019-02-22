<scrapper-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Scrapper" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">Scrapper</div>
  <!-- Description du composant -->
  <div>Scrapper une page HTLM.</div>
  <!-- Champ du composant -->
  <div class="containerH" style="justify-content:center; align-items: center;flex-wrap: wrap;height:500px;">
    <div class="containerV" style="justify-content:center; align-items: center; flex-wrap: wrap;flex-grow:1">

      <label>User ( Sauce Lab )</label>
      <input placeholder="" type="text" ref="user" value={data.specificData.user}></input>
      <label>Key ( Sauce Lab )</label>
      <input placeholder="" type="text" ref="key" value={data.specificData.key}></input>
    </div>
    <div class="containerV" style="justify-content:center; align-items: center; flex-wrap: wrap;flex-grow:1">
      <label>Name of Sauce Labs JOB
      </label>
      <input placeholder="" type="text" ref="saucelabname" value={data.specificData.saucelabname}></input>
      <label>URL
      </label>
      <input placeholder="" type="text" ref="url" value={data.specificData.url}></input>
    </div>
  </div>
  <!-- tableau scrapper -->
  <div class="containerH table-title" style="margin-top: 5px;align-items: center;justify-content:flex-end;">
    <div>Ajouter un Scénario </div>
      <image class="commandButtonImage btnAddSize" placeholder="Nouveau Scénario" src="./image/ajout_composant.svg" onclick={addRowClick}></image>
  </div>
  <zentable ref="scrapperRef" style="flex:1" drag={true} allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div class="table-title"style="padding-left: 80px;flex-grow:1">Action</div>
      <div class="table-title"style="width:10%;flex-grow:1">Nom</div>
      <div class="table-title"style="width:10%;flex-grow:1">Selection</div>
      <div class="table-title"style="width:10%;flex-grow:1">Attribut</div>
      <div class="table-title"style="width:10%;flex-grow:1">Valeur</div>
      <div class="table-title"style="flex-grow:1">X</div>
      <div class="table-title"style="padding-right: 90px;flex-grow:1">Y</div>
    </yield>
    <yield to="row">
      <select data-field="actionType" ref="actionType">
        <option each={optionValue in [" " , "getValue" , "getHtml" , "getAttr" , "setValue" , "click" , "scroll" ,"selectByValue","wait" ]} value={optionValue} selected={actionType==optionValue}>{optionValue}</option>
      </select>
      <input type="text" style="width:20%;flex-grow:1" placeholder="Nom"value={action} data-field="action"/>
      <input type="text" style="width:30%;flex-grow:1" placeholder="Selection"value={selector} data-field="selector"/>
      <input type="text" style="width:20%;flex-grow:1" placeholder="Attribut"value={attribut} data-field="attribut"/>
      <input type="text" style="width:20%;flex-grow:1" placeholder="Valeur"value={setValue} data-field="setValue"/>
      <input type="text" style="width:5%;flex-grow:1" placeholder="X"value={scrollX} data-field="scrollX"/>
      <input type="text" style="width:5%;flex-grow:1" placeholder="Y"value={scrollY} data-field="scrollY"/>
    </yield>
  </zentable>

  <style>
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
