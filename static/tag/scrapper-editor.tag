<scrapper-editor>
  <div>Information à propos du scrappeur</div>
  <label>url fixe </label>
  <input type="checkbox" name="choix3" value={ input3} onclick={ check3}></input>
  <input type="text" class={!input3? 'hide' : 'display'} name="url" value={data.specificData.url}></input>
  <label> url venant du flux precedent </label>
  <input type="checkbox" name="choix4" value={ input4} onclick={ check4}></input>
  <div>
  <h4 style="text-align:center">Create Action</h4>

  <label>Action Name</label>

  <input type="text" class="form-controle" onkeyup={actionValueChange} value={action}></input>

  <label>Choice your Action Type</label>

  <select class="form-controle" name="actionType">
  <option each={actionType in options} value={actionType}>{actionType}</option>
  </select>

  <label>Selector CSS</label>

  <input type="text" class="form-controle" onkeyup={selectorValueChange} value={selector}></input>

  <label>Property name</label>

  <input type="text" class="form-controle" onkeyup={propertyNameValueChange} value={propertyName}></input>

  <label>Attribut</label>

  <input type="text" class="form-controle" onkeyup={attributValueChange} value={attribut}></input>

  <label>Value(Set)</label>
  
  <input type="text" class="form-controle" onkeyup={setValueChange} value={setValue}></input>


  <zenTable style="flex:1" title="Your scenario">
    <yield to="header">
      <div>ActionType</div>
      <div>ActionType</div>
      <div>SelectorCSS</div>
      <div>Propertyname</div>
      <div>Attribut</div>
      <div>Value</div>
    </yield>
    <yield to="row">
      <div>{action}</div>
      <div>{selector}</div>
      <div>{propertyName}</div>
      <div>{attribut}</div>
      <div>{value}</div>
    </yield>
  </zenTable>


  <script>
    this.options = ["getValue", "getHtml", "getAttr", "setValue", "setHtml", "setAttr", "waitSelector", "click"]
    this.input3 = false;
    this.input4 = false;
    this.currentRowId = undefined;
    this.innerData = {};
    this.test = function () {
      console.log('test');
    }

    check3(e) {
      if (this.input3 == false) {
        this.input3 = true
      } else {
        this.input3 = false
      }
      console.log(this.input3)
    }

    check4(e) {
      if (this.input4 == false) {
        this.input4 = true
      } else {
        this.input4 = false
      }
      console.log(this.input4)
    }

    Object.defineProperty(this, 'data', {
      set: function (data) {
        this.innerData = data;
        this.update();
      }.bind(this),
      get: function () {
        return this.innerData;
      },
      configurable: true
    });

    this.on('mount', function () {

      this.tags.zentable.on('rowSelect', function (data) {
        this.currentRowId = data.rowid
        this.actionType = data.actionType
        this.action = data.action;
        this.selector = data.selector
        this.attribut = data.attribut
        this.propertyName = data.propertyName
        this.update();
      }.bind(this));

      this.tags.zentable.on('addRow', function () {
        this.data.specificData.scrappe.push({
          selector: this.selector,
          action: this.action,
          actioneName: this.actionType ,propertyName: this.propertyName,
          attribut: this.attribut,
          setValue:this.setValue
        });

        console.log(this.data.specificData.scrappe)
        this.tags.zentable.data = this.data.specificData.scrappe;

      }.bind(this));

      this.tags.zentable.on('delRow', function (row) {
        console.log(row);
        this.data.specificData.scrappe.splice(row.rowid, 1);
        this.tags.zentable.data = this.data.specificData.scrappe;
      }.bind(this));

      this.choix3.addEventListener('change', function (e) {
        this.data.specificData.fix_url = this.input3
      }.bind(this));

      this.url.addEventListener('change', function (e) {
        this.data.specificData.url = e.currentTarget.value;
      }.bind(this));

      this.choix4.addEventListener('change', function (e) {
        this.data.specificData.flow_before = this.input4
      }.bind(this));

    });

    RiotControl.on('item_current_changed', function (data) {
      this.data = data;
      if (this.data.specificData.scrappe == undefined) {
        this.data.specificData.scrappe = [];
      }
      console.log(this.data.specificData.scrappe);
      if (this.tags.zentable != undefined) {
        this.tags.zentable.data = this.data.specificData.scrappe;
      }
      this.update();
    }.bind(this));

    this.selectorValueChange = function (e) {
      //console.log(e.target.value);
      this.selector = e.target.value;
      console.log(this.selector);
      this.data.specificData.scrappe[this.currentRowId] = {
        selector: this.selector,
        actioneName: this.actionType,
        action: this.action,
        propertyName: this.propertyName,
        attribut: this.attribut,
        setValue:this.setValue,
      };
      var c = {}
        c[this.actionType] = {
          selector: this.selector,
          action: this.action,
          propertyName: this.propertyName,
          attribut: this.attribut,
          setValue:this.setValue
        }
        console.log(c)
      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);


    this.actionValueChange = function (e) {
      //console.log(e.target.value);
      this.action = e.target.value;
      console.log(this.action);
      this.data.specificData.scrappe[this.currentRowId] = {
        selector: this.selector,
        actioneName: this.actionType,
        action: this.action,
        propertyName: this.propertyName,
        attribut: this.attribut,
        setValue:this.setValue
      };
      var c = {}
        c[this.actionType] = {
          selector: this.selector,
          action: this.action,
          propertyName: this.propertyName,
          attribut: this.attribut,
          setValue:this.setValue
        }
        console.log(c)

      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);


    this.propertyNameValueChange = function (e) {
      //console.log(e.target.value);
      this.propertyName = e.target.value;
      console.log(this.propertyName);
      this.data.specificData.scrappe[this.currentRowId] = {
        selector: this.selector,
        actioneName: this.actionType,
        action: this.action,
        propertyName: this.propertyName,
        attribut: this.attribut,
        setValue:this.setValue
      };
            var c = {}
        c[this.actionType] = {
          selector: this.selector,
          action: this.action,
          propertyName: this.propertyName,
          attribut: this.attribut,
          setValue:this.setValue
        }
        console.log(c)
      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);

    this.attributValueChange = function (e) {
      //console.log(e.target.value);
      this.attribut = e.target.value;
      console.log(this.attribut);
      this.data.specificData.scrappe[this.currentRowId] = {
        selector: this.selector,
        actioneName: this.actionType,
        action: this.action,
        propertyName: this.propertyName,
        attribut: this.attribut,
        setValue:this.setValue
      };

      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);

    this.setValueChange = function (e) {
      //console.log(e.target.value);
      this.setValue = e.target.value;
      console.log(this.setValue);
      this.data.specificData.scrappe[this.currentRowId] = {
        selector: this.selector,
        actioneName: this.actionType,
        action: this.action,
        propertyName: this.propertyName,
        attribut: this.attribut,
        setValue:this.setValue
      };

      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);



    this.actionType.addEventListener('change', function (e) {
      //console.log(e.target.value);
      this.actionType = e.target.value;
      console.log(this.actionType);
      this.data.specificData.scrappe[this.currentRowId] = {
        selector: this.selector,
        actioneName: this.actionType,
        action: this.action,
        propertyName: this.propertyName,
        attribut: this.attribut,
        setValue:this.setValue
      };
            var c = {}
        c[this.actionType] = {
          selector: this.selector,
          action: this.action,
          propertyName: this.propertyName,
          attribut: this.attribut,
          setValue:this.setValue
        }
        console.log(c)
      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this))
  </script>
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


      /* Aspect des checkboxes */
      /* :before sert à créer la case à cocher */
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
</scrapper-editor>
    