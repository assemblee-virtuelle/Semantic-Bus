<jsonfragviewer class="containerV">
  <div id="jsonfrageditor" ref="jsonfrageditor" class="containerV scrollable" style="margin: 1vh"></div>
  <script>
    //var tag = this
    this.title = "";
    this.option = {};
    Object.defineProperty(this, "data", {
      set: function (data) {
        this.mountEditor(data).then(editor => {
          //editor.set(data);
          let tree = this.jsonToJsTree(data);
          console.log('JsonFragEditor set tree|', tree);

          editor.settings.core.data = tree;
          editor.refresh();
        });
        //  this.editor.set(data);

      }.bind(this),
      get: function () {
        return this.editor.get();
      }.bind(this),
      configurable: true
    });

    this.refreshNode = function (data, nodeId) {
      console.log('refreshNode', data, nodeId);
      //let ref=$('#containerJSTREE').jstree(true)
      var node = this.editor.get_node(nodeId);
      //console.log(node);
      node.data['_frag'] = undefined;
      var children = this.editor.get_node(nodeId).children;
      this.editor.delete_node(children);
      let focus =  this.editor.get_node(nodeId);
      let keyText = focus.original.key;
      let jsTreeNodes = this.jsonToJsTree(data);
      this.editor.rename_node(nodeId,keyText+':'+jsTreeNodes[0].text);
      jsTreeNodes[0].children.forEach(c => {
        this.editor.create_node(nodeId, c, 'last', function (e) {
          // console.log(e);
        });
      })

      this.editor.open_node(nodeId);
    }.bind(this);

    this.jsonToJsTree = function (data, key) {
      console.log('tree Generation', data, key);
      let prefix = '';
      if (key != undefined) {
        prefix = key.toString();
      }
      let separator = ' ';
      if (data instanceof Object && data != null) {
        let openingChar='';
        let closingChar='';
        let size;
        if (Array.isArray(data)) {
          openingChar = '[';
          closingChar = ']';
          size = data.length.toString();
        } else {
          if (data['_frag'] == undefined) {
            openingChar = '{';
            closingChar = '}';
          }
          size = '';
        }
        let node = {
          text: prefix + separator + openingChar + size.toString() + closingChar,
          key : prefix + separator,
          data: data,
          children: []
        }
        if (Array.isArray(data)) {
          let showDataLenght = 100
          if (data.length > showDataLenght) {
            let hideDataLenght = data.length - showDataLenght
            data = data.slice(0, showDataLenght);
            data.push(hideDataLenght + ' records hidden');
          }
        }

        for (let key in data) {
          let insertingNodes = this.jsonToJsTree(
            data[key],
            Array.isArray(data)
              ? key
              : key
          );
          node.children = node.children.concat(insertingNodes);
        }
        //return [node,{text:closingChar}];
        return [node];
      } else {
        separator = ' : ';
        let value = '';
        if (data == null) {
          value = 'null';
        } else if (data == undefined) {
          value = 'undefined';
        } else {
          value = data.toString();
        }
        return [
          {
            text: prefix + separator + value
          }
        ]
      }
    };

    this.mountEditor = function (data) {
      return new Promise((resolve, reject) => {
        if (this.editor == undefined) {
          //let treeData = this.jsonToJsTree(data); console.log('tree DIV', treeData);
          $('#jsonfrageditor').jstree({
            'core': {
              //data: treeData,
              themes: {
                icons: false,
                dots: false
              },
              check_callback: true
            }
          });
          this.editor = $('#jsonfrageditor').jstree(true);
          $('#jsonfrageditor').on("before_open.jstree", (e, node) => {
            //console.log('OPEN', node);
            if (node.node.data['_frag'] != undefined) {
              //RiotControl.trigger("cache_frag_load", node.node.data['_frag'], node.node.id)
              this.trigger("open_frag_node", node.node.data['_frag'], node.node.id)
            }
            //console.log(data.instance.get_selected(true)[0].text); console.log(data.instance.get_node(data.selected[0]).text);
          });

        }
        resolve(this.editor);
      });
    }

    this.on('mount', function () {
      this.mountEditor();
    }.bind(this));
  </script>
  <style scoped="scoped">
    #jsonfrageditor {
      border-style: solid;
      border-width: 1px;
      border-color: rgb(213, 218, 224);
    }
  </style>

</jsonfragviewer>
