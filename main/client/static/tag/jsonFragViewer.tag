<jsonfragviewer class="containerV">
  <div id="jsonfrageditor" ref="jsonfrageditor" class="containerV scrollable" style="margin: 1vh"></div>
  <script>
    //var tag = this
    this.title = "";
    this.option = {};
    this.currentContextMenu;
    Object.defineProperty(this, "data", {
      set: function (data) {
        this.mountEditor(data).then(editor => {
          //editor.set(data);
          let tree = this.jsonToJsTree(data);
          // console.log('JsonFragEditor set tree|', tree);

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
      // console.log('refreshNode', data, nodeId);
      // console.log('refreshNode');
      //let ref=$('#containerJSTREE').jstree(true)
      var node = this.editor.get_node(nodeId);
      //console.log(node);
      node.data['_frag'] = undefined;
      var children = this.editor.get_node(nodeId).children;
      this.editor.delete_node(children);
      let focus =  this.editor.get_node(nodeId);
      let keyText = focus.original.key;
      console.log('focus', focus);
      let jsTreeNodes = this.jsonToJsTree(data,focus.original.key,focus.original.path);
      this.editor.rename_node(nodeId,jsTreeNodes[0].text);
      jsTreeNodes[0].children.forEach(c => {
        this.editor.create_node(nodeId, c, 'last', function (e) {
          console.log(e);
        });
      })

      this.editor.open_node(nodeId);
    }.bind(this);

    this.escapeHtml = function(content) {
        return content
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '&#10;')
            .replace(/\r/g, '&#13;');
    }

    this.testFunction = function () {
      console.log('testFunction');
    }


    this.jsonToJsTree = function (data, key, path) {
      // console.log('tree Generation', data, key);
      const newPath =  path ? [path, key].join('.') : key;
      let prefix = '';
      if (key != undefined) {
        prefix = key.toString();
      }
      let separator = ' ';
      if (data instanceof Object && data != null) {
        let node;
        if (key == '_fileObject') {
          node = {
            text: `<div style="display:flex;flex-direction:row;align-items:flex-start;">
                <div class="menuAvailable" data-file-id="${data.id}" data-file-name="${data.filename}" >${data.filename}</div>
              </div>`,
            key : prefix,
            data: data,
            path: newPath,
            children: []
          }
        } else{
          separator = path?':':'';
          let openingChar='';
          let closingChar='';
          let size;
          if (Array.isArray(data)) {
            openingChar = '[';
            closingChar = ']';
            size = data.length.toString();
          } else {
            // if frag, we don't know if it is array or object
            if (data['_frag'] == undefined) {
              openingChar = '{';
              closingChar = '}';
            }
            size = '';
          }
          node = {
            text: `<div style="display:flex;flex-direction:row;align-items:flex-start;">
                <div class="menuAvailable" data-property="${prefix}" data-path="${path}" data-type="property">${prefix}</div>
                <div>&nbsp;${separator}&nbsp;</div>
                <div>${openingChar}${size.toString()}${closingChar}</div>
              </div>`,
            key : prefix,
            data: data,
            path: newPath,
            children: []
          }
          let showDataLenght = 100;
          if (Array.isArray(data)) {
            if (data.length > showDataLenght) {
              let hideDataLenght = data.length - showDataLenght
              data = data.slice(0, showDataLenght);
              data.push(hideDataLenght + ' records hidden');
            }
          }
          let keyCounter=0;
          for (let key in data) {
            keyCounter++;
            
            if(keyCounter<=showDataLenght+1){
              let insertingNodes = this.jsonToJsTree(
                data[key],
                Array.isArray(data)
                  ? key
                  : key,
                newPath
              );
              node.children = node.children.concat(insertingNodes);
            }else{
              break;
            }
          }
        }


        //return [node,{text:closingChar}];
        return [node];
      } else {
        let separator = ':';
        let value = '';
        if (data == null) {
          value = 'null';
        } else if (data == undefined) {
          value = 'undefined';
        } else {
          //value = data.toString().substring(0, 100) + (data.toString().length > 100 ? '...' : '');
          value = data.toString();
        }
        return [
          {
            text: `<div style="display:flex;flex-direction:row;align-items:flex-start;">
              <div class="menuAvailable" data-property="${prefix}" data-path="${[path,key].join('.')}" data-type="property">${prefix}</div>
              <div>&nbsp;${separator}&nbsp;</div>
              <div style="white-space: nowrap; max-height:100px;overflow:auto;" class="menuAvailable" data-type="value" data-content=${JSON.stringify(this.escapeHtml(value))}>${value}</div>
            </div>`
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
            if (node.node.data['_file'] != undefined) {
              //RiotControl.trigger("cache_frag_load", node.node.data['_frag'], node.node.id)
              this.trigger("open_file_node", node.node.data['_file'], node.node.id)
            }
            //console.log(data.instance.get_selected(true)[0].text); console.log(data.instance.get_node(data.selected[0]).text);
          });

        }
        resolve(this.editor);
      });
    }

    this.on('mount', function () {
      this.mountEditor();

      // Add event listener for right-click 
      this.contextMenuListener = (e) => {
        let target = e.target;
        while (target && !target.classList.contains('menuAvailable')) {
          target = target.parentElement;
        }
        if (target) {
          e.preventDefault();
          if (this.currentContextMenu) {
            document.body.removeChild(this.currentContextMenu);
            delete this.currentContextMenu;
          }
          let menus = [];
          if (target.getAttribute('data-property') != undefined) {
            menus.push({
              content: target.getAttribute('data-property'),
              text: 'copy property',
              type: 'copy'
            })
          }

          if (target.getAttribute('data-content') != undefined) {
            menus.push({
              content: target.getAttribute('data-content'),
              text : 'copy value',
              type: 'copy'
            })
          }

          if(target.getAttribute('data-path') != undefined) {
            menus.push({
              content: target.getAttribute('data-path'),
              text : 'copy path',
              type: 'copy'
            })
          }
          if(target.getAttribute('data-file-name') != undefined) {
            menus.push({
              content: target.getAttribute('data-file-name'),
              text : 'copy value',
              type: 'copy'
            })
          }

          if(target.getAttribute('data-file-id') != undefined) {
            menus.push({
              content: {
                fileId: target.getAttribute('data-file-id'),
                fileName: target.getAttribute('data-file-name')
              },
              text : 'download file',
              type: 'download'
            })
          }

          showContextMenu(e,menus);
        }
      };

      this.clickListener = (e) => {
        const target= e.target;
        if (target.getAttribute('data-fileid') != undefined) {
          RiotControl.trigger("cache_file_download", target.getAttribute('data-fileid'),target.getAttribute('data-filename'))
          //this.trigger("cache_file_download", target.getAttribute('data-fileid'))
          //this.trigger("open_file_node", target.getAttribute('data-fileid'))
        }
        if (this.currentContextMenu) {
          document.body.removeChild(this.currentContextMenu);
          delete this.currentContextMenu;
        }
      };

      document.addEventListener('contextmenu', this.contextMenuListener);
      document.addEventListener('click', this.clickListener);

      // Function to show context menu
      const showContextMenu = (event, menus) => {
        const menu = document.createElement('div'); // Correction du nom de la variable
        menu.style.position = 'absolute';
        menu.style.top = `${event.pageY}px`;
        menu.style.left = `${event.pageX}px`;
        menu.style.backgroundColor = '#fff';
        menu.style.border = '1px solid #ccc';
        menu.style.padding = '5px';
        menu.style.zIndex = 1000;
        for (let item of menus) { // Correction du nom de la variable dans la boucle
          const menuItem = document.createElement('div'); // Correction du nom de la variable
          menuItem.innerHTML = `<div style="cursor: pointer; padding: 5px; border: 1px solid #ccc; background-color: #f9f9f9;">${item.text}</div>`;
          menuItem.addEventListener('click', () => {
            if(item.type == 'copy'){
              copyToClipboard(item.content);
            }
            if(item.type == 'download'){
              RiotControl.trigger("cache_file_download", item.content.fileId, item.content.fileName)
            }
            document.body.removeChild(menu);
            delete this.currentContextMenu;
          });
          menu.appendChild(menuItem); // Ajout de l'élément au conteneur
        }
        document.body.appendChild(menu);
        this.currentContextMenu = menu
      };

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
          console.log('Text copied to clipboard', text);
        }).catch((err) => {
          console.error('Could not copy text: ', err);
        });
      };

    }.bind(this));

    this.on('unmount', function () {
      document.removeEventListener('contextmenu', this.contextMenuListener);
      document.removeEventListener('click', this.clickListener);
    }.bind(this));

  </script>
  <style scoped="scoped">
    #jsonfrageditor {
      border-style: solid;
      border-width: 1px;
      border-color: rgb(213, 218, 224);
    }

    .jstree-anchor {
      height: auto !important;
      max-width: 95%;  /* Limite la largeur à 100% du conteneur parent */
      box-sizing: border-box;
    }
  </style>

</jsonfragviewer>
