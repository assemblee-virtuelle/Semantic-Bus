<scrapper-editor>

  <label>User ( Sauce Lab )</label>

  <input type="text" ref="user" class="form-controle" value={data.specificData.user}></input>

  <label>Key ( Sauce Lab ) </h4>

  <input type="text" ref="key" class="form-controle" value={data.specificData.key}></input>

  <label>Name of Sauce Labs JOB </label>

  <input type="text" ref="saucelabname" class="form-controle" value={data.specificData.saucelabname}></input>

  <label>URL </label>

  <input type="text" ref="url" class="form-controle" value={data.specificData.url}></input>

  <h4 style="text-align:center">Create Action</h4>


  <label>Choice your Action Type</label>

  <select class="form-controle" ref="actionType" >
    <option each={actionType in options}>{actionType}</option>
  </select>

  <label>Action Name</label>

  <input type="text" class="form-controle" ref="action" value={action}></input>


  <label>Selector CSS</label>
  <input type="text" class="form-controle" ref="selector" value={selector}></input>

  <div show = {getAttr} >
    <label>Attribut</label>
    <input type="text" class="form-controle" ref="attribut" value={attribut} ></input>
  </div>
  <div>
  <div show = {setValue} >
    <label>Value</label>
    <input type="text" class="form-controle" ref="setValue" value={setValue}></input>
  </div>

  <div show = {scroll} >
    <label>scroll x </label>
    <input type="text" class="form-controle" ref="scrollX" value={scrollX}></input>
     <label>scroll y </label>
    <input type="text" class="form-controle" ref="scrollY" value={scrollY}></input>
  </div>


  <zenTable style="flex:1" drag={true} title="Your scenario" disallownavigation=false>
    <yield to="header">
      <div>Name</div>
      <div>Type</div>
      <div>Selector</div>
      <div>Attribut</div>
      <div>Value</div>
      <div>ScrollX</div>
      <div>ScrollY</div>
    </yield>
    <yield to="row">
      <div style="width:15%">{action}</div>
      <div style="width:15%">{actionType}</div>
      <div style="width:15%">{selector}</div>
      <div style="width:15%" >{attribut}</div>
      <div style="width:15%">{setValue}</div>
      <div style="width:5%">{scrollX}</div>
      <div style="width:5%">{scrollY}</div>
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
    this.options = ["getValue", "getHtml", "getAttr", "setValue", "click", "scroll","selectByValue"]
    this.currentRowId = undefined;
    this.getAttr = false
    this.setValue = false
    this.scroll = false


    //initialize
    this.data = {}
    this.data.specificData = {}
    this.data.specificData.scrappe = []

    this.updateData=function(dataToUpdate){
      console.log("datatoupdate",dataToUpdate)
      this.data = dataToUpdate;
      if(this.data.specificData.scrappe == null){
        this.data.specificData.scrappe = []
      }
      this.tags.zentable.data = this.data.specificData.scrappe;
      this.update();
    }.bind(this);

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
   
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
      this.tags.zentable.on('rowSelect', function (data) {
        console.log(data)
        this.selector = data.selector
        this.action = data.action
        this.update()
      }.bind(this));

      this.tags.zentable.on('addRow', function () {
        console.log("add row")

        if(this.refs.actionType.value == "getValue" || this.refs.actionType.value == "getHtml" ||  this.refs.actionType.value == "click"){
          this.refs.attribut = "";
          this.refs.setValue = "";
          this.refs.scrollX = "";
          this.refs.scrollY = ""
        }

        else if(this.refs.actionType.value == "setValue"){
          this.refs.attribut = "";
           this.refs.scrollX = "";
          this.refs.scrollY = "";
        }

        else if(this.refs.actionType.value == "getAttr"){
          this.refs.setValue = "";
           this.refs.scrollX = "";
          this.refs.scrollY = "";
        }

        else if(this.refs.actionType.value == "scroll"){
          this.refs.setValue = "";
        }
        
        if(this.data.specificData.scrappe == null){
           this.data.specificData.scrappe  = []
        }
        this.data.specificData.scrappe.push({
          selector: this.selector,
          action: this.action,
          actionType: this.actionType,
          attribut: this.attribut,
          setValue: this.setValue,
          scrollX: this.scrollX,
          scrollY: this.scrollY
        });
        this.update()
      }.bind(this));

      this.tags.zentable.on('delRow', function (row) {
        this.data.specificData.scrappe.splice(row.rowid, 1);
        this.tags.zentable.data = this.data.specificData.scrappe;
      }.bind(this));


      this.refs.url.addEventListener('change', function (e) {
        console.log(e.currentTarget.value);
        this.url = e.currentTarget.value;
        this.data.specificData.url = e.currentTarget.value;
      }.bind(this));

    
      this.refs.selector.addEventListener('change', function (e) {
        this.selector = e.target.value;
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


      this.refs.action.addEventListener('change', function (e) {
        this.action = e.target.value;
      }.bind(this));


     
      this.refs.scrollX.addEventListener('change', function (e) {
        this.scrollX = e.target.value;
      }.bind(this));

      this.refs.scrollY.addEventListener('change', function (e) {
        this.scrollY = e.target.value;
      }.bind(this));


      this.refs.attribut.addEventListener('change', function (e) {
        this.attribut = e.target.value;
      }.bind(this));

      this.refs.setValue.addEventListener('change', function (e) {
        this.setValue = e.target.value;
      }.bind(this));

      this.refs.actionType.addEventListener('change', function (e) {
        console.log(e.target.value);
        this.actionType = e.target.value;
        if(e.target.value == "getAttr"){
          this.getAttr = true
          this.setValue = false
        }else if(e.target.value == "setValue"){
          this.setValue = true
          this.getAttr = false
        }else if(e.target.value == "scroll"){
          this.scroll = true
          this.getAttr = false
          this.setValue = false
        }else if(e.target.value == "selectByValue"){
          this.setValue = true
          this.getAttr = false
          this.scroll = false
        }else{
          this.setValue = false
          this.getAttr = false
          this.scroll = false
        }
        this.update()
      }.bind(this))
    })
  </script>
</scrapper-editor>
