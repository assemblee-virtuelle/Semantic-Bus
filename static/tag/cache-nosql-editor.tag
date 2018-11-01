<cache-nosql-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">CACHE NO SQL</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;width: 90%;">Ce composant permet de stocker les données traitées dans une base de données (cache). Cela permet d’avoir toujours des données finalisées à disposition sans avoir besoin de refaire tous les calculs. L’intérêt est un gain substantiel de performance. Ce stockage n’est pas considéré comme une base de donnée “métier” mais uniquement un stockage technique.</label>
  <label style="padding-top: 10px;">Sauvegarder un flux et le réutiliser sans avoir besoin de requeter la source</label>
  <!-- Champ du composant -->
  <div>Mettre en cache les données et les réintéroger</div>
  <label style="padding-top: 10px;">Historisation</label>
  <input ref="historyInput" type="checkbox" onchange={historyInputChanged} checked={data.specificData.history}></input>
  <label style="padding-top: 10px;">Sortie avec historique</label>
  <input ref="historyOutInput" type="checkbox" onchange={historyOutInputChanged} checked={data.specificData.historyOut}></input>
  <jsonFragViewer style="width: 90%;"ref="jsonFragViewer"></jsonFragViewer>
  <script>

    this.data = {};
    historyInputChanged(e) {
      console.log(e);
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
      //   console.log(data,nodeId);   let ref=$('#containerJSTREE').jstree(true)   var node = ref.get_node(nodeId);   //console.log(node);   node.data['_frag']=undefined;   var children = ref.get_node(nodeId).children;   ref.delete_node(children);   let
      // jsTreeNodes= this.jsonToJsTree(data); //  console.log(jsTreeNodes);   jsTreeNodes[0].children.forEach(c=>{     ref.create_node(nodeId,c,'last',function(e){       console.log(e);     });   })
      //
      //   ref.open_node(nodeId); console.log($('#containerJSTREE').jstree(true).last_error());

    }.bind(this);

    this.refreshCache = function (cachedData) {
      this.refs.jsonFragViewer.data = cachedData;
      // let treeData = this.jsonToJsTree(cachedData); console.log('tree DIV', treeData); $('#containerJSTREE').jstree({   'core': {     data: treeData,     themes: {       icons: false,       dots: false     },     check_callback :jsonfrageditor true   }
      // }); $('#containerJSTREE').on("before_open.jstree", (e, node) => {   console.log('OPEN',node);   if (node.node.data['_frag']!=undefined){     RiotControl.trigger("cache_frag_load",node.node.data['_frag'],node.node.id)   }
      // //console.log(data.instance.get_selected(true)[0].text);   //console.log(data.instance.get_node(data.selected[0]).text); }); $('#containerJSTREE').jstree({   'core': {     'data': [       {         "text": "Root node",         "children": [
      //    {             "text": "Child node 1"           }, {             "text": "Child node 2"           }         ]       } ] } });
      this.update();
    }.bind(this);

    this.on('mount', function () {
      //console.log('CACHE MOUNT');
      this.refs.jsonFragViewer.on('open_frag_node', (fragId, nodeId) => {
        //console.log('OPEN', fragId, nodeId);
        RiotControl.trigger("cache_frag_load", fragId, nodeId)
      })
      RiotControl.on('item_current_changed', this.updateData);
      RiotControl.on('item_current_getCache_done', this.refreshCache);
      RiotControl.on('cache_frag_loaded', this.refreshFrag);
      RiotControl.trigger('item_current_getCache');
    });
    this.on('unmount', function () {
      //console.log('CACHE UNMOUNT');
      RiotControl.off('item_current_changed', this.updateData);
      RiotControl.off('item_current_getCache_done', this.refreshCache);
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
