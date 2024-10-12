<cache-nosql-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Cache-NoSQL" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <!-- Champ du composant -->
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->
  <fieldset id="containerJSTREE" style="margin: 1vh">
    <legend class="labelFormStandard">Options</legend>
    <div>
      <input ref="historyInput" type="checkbox" onchange={historyInputChanged} checked={data.specificData && data.specificData.history}>
      <label >Historisation</label>
    </div>
    <div>
      <input ref="historyOutInput" type="checkbox" onchange={historyOutInputChanged} checked={data.specificData&& data.specificData.historyOut}>
      <label>Sortie avec historique</label>
    </div>
  </fieldset>

  <jsonfragviewer ref="jsonFragViewer"></jsonfragviewer>

  <script>

    this.data = {};
    historyInputChanged(e) {
      if (this.data != null && this.data.specificData != null) {
        this.data.specificData.history = e.target.checked;
      }
    }

    historyOutInputChanged(e) {
      if (this.data != null && this.data.specificData != null) {
        this.data.specificData.historyOut = e.target.checked;
      }
    }

    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.refreshFrag = function (data, nodeId) {
      this.refs.jsonFragViewer.refreshNode(data, nodeId);
      // console.log(data,nodeId);   let ref=$('#containerJSTREE').jstree(true)   var node = ref.get_node(nodeId);   console.log(node);   node.data['_frag']=undefined;   var children = ref.get_node(nodeId).children;   ref.delete_node(children);   let
      // jsTreeNodes= this.jsonToJsTree(data);   console.log(jsTreeNodes);   jsTreeNodes[0].children.forEach(c=>{     ref.create_node(nodeId,c,'last',function(e){       console.log(e);     });   })
      //
      //   ref.open_node(nodeId); console.log($('#containerJSTREE').jstree(true).last_error());

    }.bind(this);

    this.refreshCache = function (cachedData) {
      this.refs.jsonFragViewer.data = cachedData;
      // let treeData = this.jsonToJsTree(cachedData); console.log('tree DIV', treeData); $('#containerJSTREE').jstree({   'core': {     data: treeData,     themes: {       icons: false,       dots: false     },     check_callback :jsonfrageditor true   }
      // }); $('#containerJSTREE').on("before_open.jstree", (e, node) => {   console.log('OPEN',node);   if (node.node.data['_frag']!=undefined){     RiotControl.trigger("cache_frag_load",node.node.data['_frag'],node.node.id)   }
      // console.log(data.instance.get_selected(true)[0].text);   console.log(data.instance.get_node(data.selected[0]).text); }); $('#containerJSTREE').jstree({   'core': {     'data': [       {         "text": "Root node",         "children": [    {
      // "text": "Child node 1"           }, {             "text": "Child node 2"           }         ]       } ] } });
      this.update();
    }.bind(this);

    this.refreshFile = function (file, nodeId) {
      const fileInfo={
        _fileObject:{
          filename:file.filename,
          id : file.id
        }
      }
      this.refs.jsonFragViewer.refreshNode(fileInfo, nodeId);
    }.bind(this);

    this.on('mount', function () {
      //console.log('CACHE MOUNT');
      this.refs.jsonFragViewer.on('open_frag_node', (fragId, nodeId) => {
        //console.log('OPEN', fragId, nodeId);
        RiotControl.trigger("cache_frag_load", fragId, nodeId)
      })
      this.refs.jsonFragViewer.on('open_file_node', (fileId, nodeId) => {
        //console.log('OPEN', fragId, nodeId);
        RiotControl.trigger("cache_file_load", fileId, nodeId)
      })
      RiotControl.on('item_current_changed', this.updateData);
      RiotControl.on('item_current_getCache_done', this.refreshCache);
      RiotControl.on('cache_frag_loaded', this.refreshFrag);
      RiotControl.on('cache_file_loaded', this.refreshFile);
      RiotControl.trigger('item_current_getCache');
    });
    this.on('unmount', function () {
      //console.log('CACHE UNMOUNT');
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('item_current_getCache_done', this.refreshCache);
      RiotControl.off('cache_file_loaded', this.refreshFile);
      RiotControl.off('cache_frag_loaded', this.refreshFrag);
    });
  </script>
  <style>
    #containerJSTREE {
      border-style: solid;
      border-width: 1px;
    }
  </style>
</cache-nosql-editor>
