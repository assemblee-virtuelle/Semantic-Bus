<mongo-connecteur-editor>
  <div style ="padding: 5%;">
      <label>URI de connexion </label>
      <input type="text" ref="url" value={data.specificData.url}/>
      <label>nom du model</label>
      <input type="text" ref="modelName" value={data.specificData.modelName}/>
      <h3 style="margin-top:5%;"> Valeur( ne mettez pas le model seulement la query) </h3>
      <h5 style="margin-top:2%;"> Documentation requetes: http://mongoosejs.com/docs/queries.html</h5>
      <textarea placeholder="exemple: findOne({ 'email': 'alexbocenty@hotmail.fr' });" style="width: 100%;height: 50%; background-color: white;color: rgb(56, 131, 250);padding: 5px;border-radius: 10px;border: 1px solid rgb(56, 131, 250);"
          type="textarea" ref="querySelect" value={data.specificData.querySelect}>
          {data.specificData.querySelect}
      </textarea>
  </div>
<script>

  //initialize
  this.data = {}
  this.data.specificData = {}


  this.updateData=function(dataToUpdate){
    console.log("datatoupdate",dataToUpdate)
    this.data = dataToUpdate;
    this.update();
  }.bind(this);

  //mount
  this.on('mount', function (){
    this.connected = false
    this.query = false
    this.refs.url.addEventListener('change',function(e){
      this.data.specificData.url=e.currentTarget.value;
    }.bind(this));

    this.refs.modelName.addEventListener('change',function(e){
      this.data.specificData.modelName = e.currentTarget.value;
    }.bind(this));

    this.refs.querySelect.addEventListener('change',function(e){
      this.data.specificData.querySelect=e.currentTarget.value;
    }.bind(this));

    RiotControl.on('item_current_changed',this.updateData);
  });

  //unmount
  this.on('unmount', function () {
    RiotControl.off('item_current_changed',this.updateData);
  });
</script>

</mongo-connecteur-editor>