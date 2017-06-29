<scrapper-editor>
  <div>Information à propos du scrappeur</div>
  <label>url fixe </label>
    <input type="checkbox"  name="choix3" value= {input3} onclick= {check3}></input>
    <input type="text" class={!input3? 'hide' : 'display'} name="url" value={data.specificData.url}></input>
  <label> url venant du flux precedent </label>
    <input type="checkbox"  name="choix4" value= {input4} onclick= {check4} ></input>
  <div>
    <label>chemin</label>
      <input type="text" onkeyup={cheminValueChange} value={fieldValue}></input>
    <label> attribut </label>
      <input type="text" onkeyup={attributValueChange} value={attributField} placeholder=" [WARNING] 'attribs.href' ou 'text' seulement pour le moment" ></input>
  </div>
     <zenTable style="flex:1" title="Chemin et attributs">
        <yield to="header">
          <div>chemin</div>
          <div>attribut</div>
        </yield>
        <yield to="row">
          <div>{field}</div>
          <div>{attribut}</div>
        </yield>
    </zenTable>
  <script>

      this.input3 = false;
      this.input4 = false;
      this.currentRowId = undefined;
      this.innerData={};
      this.test=function(){
        console.log('test');
      }

      check3(e){
        if( this.input3 == false){
            this.input3 = true  
        }
        else{
          this.input3 = false
        }
        console.log(this.input3)
      }

      check4(e){
        if( this.input4 == false){
            this.input4 = true  
        }
        else{
          this.input4 = false
        }
        console.log(this.input4)
      }

      Object.defineProperty(this, 'data', {
        set: function (data) {
          this.innerData=data;
          this.update();
        }.bind(this),
        get: function () {
          return this.innerData;
        },
        configurable: true
      });

      this.on('mount', function () {
      this.tags.zentable.on('rowSelect', function (data) {
        console.log(data);
        this.currentRowId=data.rowid
        this.fieldValue = data.field;
        this.attributField = data.attribut
        this.update();
      }.bind(this));
      this.tags.zentable.on('addRow', function () {
        //console.log(this.data.specificData.scrappe)
        this.data.specificData.scrappe.push({field: this.fieldValue, attribut: this.attributField});
        this.tags.zentable.data = this.data.specificData.scrappe;
        console.log(this.tags.zentable.data)
      }.bind(this));

      this.tags.zentable.on('delRow', function (row) {
        console.log(row);
        this.data.specificData.scrappe.splice(row.rowid, 1);
        this.tags.zentable.data = this.data.specificData.scrappe;
      }.bind(this));

      this.choix3.addEventListener('change',function(e){
        this.data.specificData.fix_url = this.input3
      }.bind(this));

      this.url.addEventListener('change',function(e){
        this.data.specificData.url = e.currentTarget.value;
      }.bind(this));

      this.choix4.addEventListener('change',function(e){
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

    this.cheminValueChange = function (e) {
      //console.log(e.target.value);
      console.log("cheminValueChange");
      this.fieldValue = e.target.value;
      this.data.specificData.scrappe[this.currentRowId]={field:this.fieldValue, attribut:this.attributField};
      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);


     this.attributValueChange = function (e) {
      console.log("attributValueChange");
      this.attributField = e.target.value;
      this.data.specificData.scrappe[this.currentRowId]={attribut:this.attributField};
      this.tags.zentable.data = this.data.specificData.scrappe;
    }.bind(this);

      
  </script>
  <style> 

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
    