<sql-connecteur-editor>
<div style="display: flex;flex-direction: row;justify-content: space-around;">
    <div class="{color1}" style="margin-left: 7%;" onclick={goConnection}>Connexion(s)</div>
    <div class="{color2}" style="margin-left: 7%;" onclick={goModelDescription}>Edition model(s)</div>
    <div class="{color3}" style="margin-left: 7%;" onclick={goQuery}>Query</div>
</div>
<div if={connection}>
    <div>description de quel type de base a interoger</div>
    <label>url</label>
    <input type="text" name="driver" value={data.specificData.driver}/>
    <label>host</label>
    <input type="text" name="host" value={data.specificData.host}/>
    <label>port</label>
    <input type="text" name="port" value={data.specificData.port}/>
    <label>username</label>
    <input type="text" name="username" value={data.specificData.username}/>
    <label>password</label>
    <input type="text" name="password" value={data.specificData.password}/>
    <label>database</label>
    <input type="text" name="database" value={data.specificData.database}/>
    <div style="display: flex;justify-content: space-around;margin-top: 5%;">
      <button class="sql-btn" onclick={ connectesql} type="button">Connexion</button>
    </div>
</div>
<div if={editionModel}>
    <div>configuration vos models objects de base de donnée</div>
    <label>nom du model</label>
    <input type="text" name="modelName" value={data.specificData.modelName}/>
    <jsonEditor name="jsonSchema" title="Schema Caminte" style="flex:1;height: 50vh;" modes="['tree','text']"></jsonEditor>
    <div style="display: flex;justify-content:  space-around;margin-top: 5%;">
        <button class="sql-btn" onclick={ validateModel} type="button">Valider model</button>
    </div>
</div>
<div if={queryMode}>
    <div style="display:flex; flex-direction: column;">
        <div>
            <h3 style="margin-top:5%;"> Séléctionner votre/vos type(s) de query </h3>
            <div style="display: flex; padding: 5px;">
                <div each={this.queryData} onclick={toggle}>
                    <div class="cb {this.selected?'':'cb-selected'}">
                        <label for="checkbox-{this.id}" class="pure-button {this.selected?'button-muted':''}">
                            <input style="display:none" type="checkbox" id="checkbox-{this.id}" checked={this.selected}/>
                            <span> {query}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div>
            <h3 style="margin-top:5%;"> Séléctionner le/les attribut(s) concerné(s) </h3>
            <div style="display: flex; padding: 5px;">
                <div each={this.selectData} onclick={toggle}>
                    <div class="cb {this.selected?'':'cb-selected'} ">
                        <label for="checkbox-{this.id}" class="pure-button {this.selected?'button-muted':''}">
                            <input style="display:none" type="checkbox" id="checkbox-{this.id}" checked={this.selected}/>
                            <span> {property}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div> -->
        <div>
            <h3 style="margin-top:5%;"> Valeur </h3>
            <h5 style="margin-top:2%;"> Documentation requetes: http://www.camintejs.com/en/guide#common-api </h5>
            <textarea placeholder="Par defaut la requetete sort toute les donnés" style="width: 100%;height: 50%; background-color: white;color: rgb(56, 131, 250);padding: 5px;border-radius: 10px;border: 1px solid rgb(56, 131, 250);"
                type="textarea" name="querySelect" value={data.specificData.querySelect}>
                {data.specificData.querySelect_stringify}
            </textarea>
        </div>
    </div>
    <div style="display: flex;justify-content: space-around;margin-top: 5%;">
      <button class="sql-btn" onclick={ generateRequest} type="button">Generer query</button>
    </div>
</div>
<style>
    .white {
      width: 15%;
      text-align: center;
      border-bottom-style: solid;
      cursor: pointer;
      color: #3883fa;
      border: none;
      border-radius: 0px;
    }

    .blue {
      width: 15%;
      text-align: center;
      border-bottom-style: solid;
      border-bottom: 1.4px solid #3883fa !important;
      cursor: pointer;
      color: #3883fa;
      border: none;
      border-radius: 0px;
    }
    .sql-btn {
      color: #ffffff;
      background-color: #3883fa;
      border: none;
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
      max-width: 25%;
    }


		.section {
		  background-color: #fff;
		  padding: 40px;
		}

		.cb {
			transition: color 0.5s ease-out;
			color: #73c128;
      padding:5px;
		}
		.cb-selected {
		}
		.cb-hide {
			display: none;
		}

	

		.cb i{
			min-width: 30px;
		}

		.err{
			color:#c2185b;
		}

    .pure-button {
      transition: color 0.5s ease-out;
      background-color: white;
      color: #3883fa;
      padding: 5px;
      border-radius: 10px;
      border: 1px solid #3883fa;
    }

    .button-muted {
      transition: color 0.5s ease-out;
      background-color: #3883fa;
      color:white;
    }
    .br{
      margin-top: 20px;
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: #ccc dotted 1px;
      display: block;
    }
</style>
<script>


  //front animation 
  this.color1 = "blue";
  this.color2 = "white";
  this.color3 = "white";
  this.connection = true;
  this.editionModel = false;
  this.queryMode = false;
  this.innerData={};
  this.queryData = [{selected: false, query: "where"}, {selected: false, query: "group"},{selected: false, query: "order"},{selected: false, query: "skip"},{selected: false, query: "limit"}  ]
  

    goQuery(e){
        this.editionModel = false;
        this.connection = false;
        this.queryMode = true;
        this.color2 = "white"
        this.color1 = "white"
        this.color3 = "blue"
        this.update()
    }.bind(this)

    goModelDescription(e){ 
      this.editionModel = true;
      this.connection = false;
      this.queryMode = false;
      this.color2 = "blue"
      this.color1 = "white"
      this.color3 = "white"
      //console.log(this.workspace._id.$oid)
      //RiotControl.trigger('load_all_profil_by_workspace', {_id: this.workspace._id.$oid})
    }.bind(this)

    goConnection(e){
      this.editionModel = false;
      this.connection = true;
      this.queryMode = false;
      this.color2 = "white"
      this.color1 = "blue"
      this.color3 = "white"
    }.bind(this)

    onFilter(e) {
      this.text = e.target.value
      filter = this.text
    }

    showSelectedServices(item) {
      return item.selected
    }

    showServices(item) {
      if(item.name == '') return false;
      if(filter.length == 0 || item.selected) return true;
      return item.name.search(new RegExp(filter, "i")) != -1
    }

    toggle(e) {
      var item = e.item;
      item.selected = !item.selected;
      return false;
    }

    this.contains = function(a, obj) {
      if(obj != false){
        var i = a.length;
        while (i--) {
            if (a[i].query === obj.query) {
                return true;
            }
          }
          return false;
      }
    }


    this.generateRequest = function(){
      var modelName = this.data.specificData.modelName;
      var modelData = this.tags.jsonSchema.data;
      this.queryDatas = [];
      this.data.specificData.querySelect = [];
      this.data.specificData.querySelect_stringify = null
      new Promise(function(resolve,reject){
        for (attribsqueryData in this.queryData){
          if(this.queryData[attribsqueryData].selected == true){
            this.queryDatas.push(this.queryData[attribsqueryData])
          }
          resolve(this.queryDatas)
        }
      }.bind(this)).then(function(queryTable){
           console.log("START")
          console.log(queryTable.length)
          if(queryTable.length == 0){
             this.update()
          } else if (queryTable.length == 1){
            console.log("in other")
            //for(attribs in this.selectData){
              //if(this.selectData[attribs].selected == true){
                if(queryTable[0].query == "where"){
                  this.data.specificData.querySelect.push({query: queryTable[0].query, attributs:"Entre votre clé ici", value: "entrez votre valeur ici"  });
                }else if(queryTable[0].query == "order" || queryTable[0].query == "group"||queryTable[0].query ==  "asc" || queryTable[0].query == "desc"){
                  this.data.specificData.querySelect.push({query: queryTable[0].query, value: "entrez votre valeur ici(String)"});
                }else if(queryTable[0].query == "skip" || queryTable[0].query == "limit"){
                  this.data.specificData.querySelect.push({query: queryTable[0].query, value: "entrez votre valeur ici(Number)"});
                }
                this.data.specificData.querySelect_stringify = JSON.stringify(this.data.specificData.querySelect) 
                console.log("request generate ||", this.data.specificData.querySelect)
                this.update()
              //}
            //}
          }else if (queryTable.length > 1){
              console.log("in last elsif")
              this.data.specificData.querySelect = [];
              //for(attribs in this.selectData) {
                //console.log(this.selectData[attribs])
                //if(this.selectData[attribs].selected == true){
                  for(queryElement in queryTable){
                    console.log("queryElement", queryTable[queryElement].query)
                    if(queryTable[queryElement].query == "where"){
                      this.data.specificData.querySelect.push({query: queryTable[queryElement].query, attributs: "entrez votre clef ici" , value: "entrez votre valeur ici"  });
                    }else if(queryTable[queryElement].query == "order" || queryTable[queryElement].query == "group"|| queryTable[queryElement].query ==  "asc" || queryTable[queryElement].query == "desc"){
                      this.data.specificData.querySelect.push( {query: queryTable[queryElement].query, value: "entrez votre valeur ici(String)"  });
                    }else if(queryTable[queryElement].query == "skip" || queryTable[queryElement].query == "limit"){
                      this.data.specificData.querySelect.push({query: queryTable[queryElement].query, value: "entrez votre valeur ici(Number)"  });
                    }
                  }
                   this.data.specificData.querySelect_stringify = JSON.stringify(this.data.specificData.querySelect) 
             //   }
              //}
              this.update()
          } 
        }.bind(this))
    }
    

    this.connectesql = function(){
        console.log(this.data.specificData)
        this.editionModel = true;
        this.connection = false;
        this.queryMode = false;
        this.color2 = "blue"
        this.color1 = "white"
        this.color3 = "white"
        this.update()
    }

    this.validateModel = function(){
        this.editionModel = false;
        this.connection = false;
        this.queryMode = true;
        this.color2 = "white"
        this.color1 = "white"
        this.color3 = "blue"
        this.selectData = [];
        this.data.specificData.jsonSchema = this.tags.jsonSchema.data;
        this.data.specificData.modelName = data.specificData.modelName;
        for (property in this.tags.jsonSchema.data){
          this.selectData.push({property : property, selected: false})
        }  
    }

    this.request = function(){
      this.data.specificData.modelName
    }



    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData = data;
         this.tags.jsonSchema.data = data.specificData.jsonSchema;
         this.update();
       }.bind(this),
       get: function () {
        this.tags.jsonSchema.data = this.innerData.specificData.jsonSchema;
        return this.innerData;
      },
      configurable: true
    });

    this.on('mount', function (){
      this.connected = false
      this.query = false
      this.driver.addEventListener('change',function(e){
        this.innerData.specificData.driver=e.currentTarget.value;
      }.bind(this));

      this.host.addEventListener('change',function(e){
        this.innerData.specificData.host=e.currentTarget.value;
      }.bind(this));

      this.port.addEventListener('change',function(e){
        this.innerData.specificData.port=e.currentTarget.value;
      }.bind(this));

      this.username.addEventListener('change',function(e){
        this.innerData.specificData.username=e.currentTarget.value;
      }.bind(this));

      this.password.addEventListener('change',function(e){
        this.innerData.specificData.password=e.currentTarget.value;
      }.bind(this));

      this.database.addEventListener('change',function(e){
        this.innerData.specificData.database=e.currentTarget.value;
      }.bind(this));

      this.modelName.addEventListener('change',function(e){
        this.innerData.specificData.modelName=e.currentTarget.value;
      }.bind(this));

      this.querySelect.addEventListener('change',function(e){
        this.innerData.specificData.querySelect=e.currentTarget.value;
      }.bind(this));
      

      RiotControl.on('item_current_changed',function(data){
        this.innerData=data;
        this.update();
      }.bind(this));
    });
  </script>
  

</sql-connecteur-editor>