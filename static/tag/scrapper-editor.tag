<scrapper-editor class="containerV">

  <div class="commandBar" style="justify-content:flex-end">
    <label>User ( Sauce Lab )</label>
    <input type="text" ref="user" class="form-controle" value={data.specificData.user}></input>
    <label>Key ( Sauce Lab ) </h4>
    <input type="text" ref="key" class="form-controle" value={data.specificData.key}></input>
    <label>Name of Sauce Labs JOB </label>
    <input type="text" ref="saucelabname" class="form-controle" value={data.specificData.saucelabname}></input>
    <label>URL </label>
    <input type="text" ref="url" class="form-controle" value={data.specificData.url}></input>
    <div class="containerH">
      <h4 style="text-align:center">Create Action </h4>
      <image class="commandButtonImage" src="./image/ajout_composant.svg" width="50" height="50" onclick={addRowClick}></image>
    </div>
    <h4 style="text-align:left">Séléctionné votre type d'action</h4>
    <!--  <select ref="actionType" style="flex-basis:50%" >
      <option each={actionType in options}>{actionType}</option>
    </select>  -->
  </div>

  <zenTable ref="scrapperRef" style="flex:1" drag={true} title="vos changement de valeurs" allowdirectedit={true} disallowselect={true} disallownavigation={true}>
    <yield to="header">
      <div style="width:20%">Action</div>
      <div style="width:20%">Name</div>
      <div style="width:20%">Selector</div>
      <div style="width:20%">Attribut</div>
      <div style="width:20%">Value</div>
      <div style="width:20%">ScrollX</div>
      <div style="width:20%">ScrollY</div>
    </yield>
    <yield to="row" >
      <select data-field="actionType" ref="actionType" style="flex-basis:20%">
        <option each={actionType in ["getValue", "getHtml", "getAttr", "setValue", "click", "scroll","selectByValue"]} value={actionType}>{actionType}</option>
      </select>
      <input type="text" style="width:20%" value={action} data-field="action"/>
      <input type="text" style="width:20%" value={selector} data-field="selector"/>
      <input type="text" style="width:20%" value={attribut} data-field="attribut"/>
      <input type="text" style="width:20%" value={setValue} data-field="setValue"/>
      <input type="text" style="width:20%" value={scrollX} data-field="scrollX"/>
      <input type="text" style="width:20%" value={scrollY} data-field="scrollY"/>
    </yield>
  </zenTable>

  <style>
    .form-controle {
      display: block;
      width: 100%;
      padding: .5rem .75rem;
      font-size: 1rem;
      line-height: 1.25;
      color: #464a4c;
      background-color: #fff;
      background-image: none;
      -webkit-background-clip: padding-box;
      background-clip: padding-box;
      border: 1px solid rgba(0,0,0,.15);
      border-radius: .25rem;
      -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
      transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
      -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
      transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
      transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
    }

    .hide {
      display:none;
    }


    .display {
      display:block;
    }

    [type="checkbox"]:not(:checked) + label:before,

    [type="checkbox"]:checked + label:before {
      content: '';
      position: absolute;
      left:0; top: 2px;
      width: 17px; height: 17px; /* dim. de la case */
      border: 1px solid #aaa;
      background: #f8f8f8;
      border-radius: 3px; /* angles arrondis */
      box-shadow: inset 0 1px 3px rgba(0,0,0,.3) /* légère ombre interne */
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
      this.refs.scrapperRef.data = this.data.specificData.scrapperRef|| [];
      this.update();
    }.bind(this);

    recalculateHeader() {
      var headers = this.tags.zentable.refs.tableHeader.children;
      for (var row of this.root.querySelectorAll('.tableRow')) {
        for (var headerkey in headers) {
          var numkey = parseInt(headerkey);
          if (!isNaN(numkey)) {
            //console.log(row.children[numkey].getBoundingClientRect().width);
            var width = row.children[numkey].getBoundingClientRect().width;
            var cssWidth = width + 'px';
            headers[headerkey].style.width = cssWidth ;
            headers[headerkey].style.maxWidth = cssWidth ;
            headers[headerkey].style.minWidth = cssWidth ;
            headers[headerkey].style.flexBasis = cssWidth ;
            //console.log(headers[headerkey].style);
          }
        }
        break;
      }
    }




    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });

    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);

      this.refs.scrapperRef.on('onValueChange', (data) => {

      });

      this.refs.scrapperRef.on('dataChanged',data=>{
        this.data.specificData.scrapperRef = data;
      });

      this.refs.scrapperRef.on('delRow',(row) => {
        this.refs.scrapperRef.data.splice(row.rowid, 1);
      });

      RiotControl.on('item_current_changed', this.updateData);

      this.refs.url.addEventListener('change', function (e) {
        this.url = e.currentTarget.value;
        this.data.specificData.url = e.currentTarget.value;
        console.log(this.data.specificData)
      }.bind(this));

      this.refs.user.addEventListener('change', function (e) {
        this.user = e.target.value;
        this.data.specificData.user = e.currentTarget.value;
      }.bind(this));


      this.refs.key.addEventListener('change', function (e) {
        this.key = e.target.value;
        this.data.specificData.key = e.currentTarget.value;
      }.bind(this));

      this.refs.saucelabname.addEventListener('change', function (e) {
        this.key = e.target.value;
        this.data.specificData.saucelabname = e.currentTarget.value;
      }.bind(this));

    });
  </script>
</scrapper-editor>
