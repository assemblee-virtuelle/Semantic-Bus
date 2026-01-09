<jsonfragviewer class="containerV">
  <div id="jsonfrageditor" ref="jsonfrageditor" class="containerV scrollable" style="margin: 1vh"></div>
  
  <!-- Popup for load more options -->
  <div if={showLoadMorePopup} class="load-more-overlay" onclick={closeLoadMorePopup}>
    <div class="load-more-popup" onclick={preventClosePopup}>
      <div class="popup-header">
        <h3>Charger plus d'éléments</h3>
        <span onclick={closeLoadMorePopup} class="close-button">×</span>
      </div>
      <div class="popup-content">
        <p>Il reste {loadMoreRemainingCount} {loadMoreIsArray ? 'éléments' : 'propriétés'} à charger.</p>
        <label for="batchSizeInput">Nombre d'éléments à charger:</label>
        <input type="number" id="batchSizeInput" value={loadMoreBatchSize} min="1" max={loadMoreRemainingCount} onchange={updateBatchSize}>
      </div>
      <div class="popup-actions">
        <button onclick={loadMoreItemsWithBatch}>Charger {loadMoreBatchSize} élément(s)</button>
        <button onclick={loadAllRemainingItems}>Charger tout ({loadMoreRemainingCount})</button>
      </div>
    </div>
  </div>
  
  <script>
    //var tag = this
    this.title = "";
    this.option = {};
    this.currentContextMenu;
    
    // Popup state for load more
    this.showLoadMorePopup = false;
    this.loadMoreNodeId = null;
    this.loadMoreRemainingCount = 0;
    this.loadMoreBatchSize = 100;
    this.loadMoreIsArray = false;
    
    // Cache to store full data and pagination info by node path
    this.paginationCache = new Map();
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
      let jsTreeNodes = this.jsonToJsTree(data,focus.original.key,focus.original.path);
      this.editor.rename_node(nodeId,jsTreeNodes[0].text);
      jsTreeNodes[0].children.forEach(c => {
        this.editor.create_node(nodeId, c, 'last');
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

    this.preventClosePopup = function(e) {
      e.stopPropagation();
    }

    this.closeLoadMorePopup = function() {
      this.showLoadMorePopup = false;
      this.update();
    }.bind(this);

    this.updateBatchSize = function(e) {
      this.loadMoreBatchSize = parseInt(e.target.value) || 100;
      this.update();
    }.bind(this);

    this.showLoadMoreDialog = function(loadMoreNodeId) {
      const loadMoreNode = this.editor.get_node(loadMoreNodeId);
      if (loadMoreNode && loadMoreNode.data._isLoadMore) {
        this.loadMoreNodeId = loadMoreNodeId;
        this.loadMoreRemainingCount = loadMoreNode.data._remainingCount;
        this.loadMoreBatchSize = Math.min(100, loadMoreNode.data._remainingCount);
        this.loadMoreIsArray = loadMoreNode.data._isArray;
        this.showLoadMorePopup = true;
        this.update();
      }
    }.bind(this);

    this.loadMoreItemsWithBatch = function(e) {
      e.stopPropagation();
      this.closeLoadMorePopup();
      
      // Show global loader
      RiotControl.trigger('persist_start');
      
      // Use setTimeout to allow UI to update with spinner
      setTimeout(() => {
        this.loadMoreItems(this.loadMoreNodeId, this.loadMoreBatchSize);
        // Hide global loader
        RiotControl.trigger('persist_end');
      }, 100);
    }.bind(this);

    this.loadAllRemainingItems = function(e) {
      e.stopPropagation();
      this.closeLoadMorePopup();
      
      // Show global loader
      RiotControl.trigger('persist_start');
      
      // Use setTimeout to allow UI to update with spinner
      setTimeout(() => {
        this.loadMoreItems(this.loadMoreNodeId, this.loadMoreRemainingCount);
        // Hide global loader
        RiotControl.trigger('persist_end');
      }, 100);
    }.bind(this);

    this.loadMoreItems = function(loadMoreNodeId, batchSize) {
      const loadMoreNode = this.editor.get_node(loadMoreNodeId);
      if (!loadMoreNode) {
        console.error('loadMoreNode not found');
        return;
      }

      // Get parent node
      const parentNode = this.editor.get_node(loadMoreNode.parent);
      if (!parentNode) {
        console.error('Parent node not found');
        return;
      }

      // Get pagination cache
      const parentPath = loadMoreNode.data._parentPath;
      const cacheEntry = this.paginationCache.get(parentPath);
      if (!cacheEntry) {
        console.error('Cache entry not found for path:', parentPath);
        return;
      }

      const fullData = cacheEntry.fullData;
      const currentDisplayed = loadMoreNode.data._currentCount;
      const totalCount = loadMoreNode.data._totalCount;
      const isArray = loadMoreNode.data._isArray;

      // Calculate new range
      const newStartIndex = currentDisplayed;
      const newEndIndex = Math.min(currentDisplayed + batchSize, totalCount);
      
      // Delete the load more node
      this.editor.delete_node(loadMoreNode);

      // Add new items
      let keyCounter = 0;
      for (let key in fullData) {
        keyCounter++;
        
        if (keyCounter > newStartIndex && keyCounter <= newEndIndex) {
          let insertingNodes = this.jsonToJsTree(
            fullData[key],
            isArray ? key : key,
            parentPath
          );
          insertingNodes.forEach(node => {
            this.editor.create_node(parentNode.id, node, 'last');
          });
        }
      }

      // Add new load more node if there are still more items
      if (newEndIndex < totalCount) {
        const remainingCount = totalCount - newEndIndex;
        const newLoadMoreNode = {
          text: `<div style="display:flex;flex-direction:row;align-items:center;cursor:pointer;color:#0066cc;">
              <div class="load-more-node" data-path="${parentPath}" data-remaining="${remainingCount}" data-is-array="${isArray}">
                ⋯ ${remainingCount} ${isArray ? 'éléments' : 'propriétés'} masqué(s) - Cliquer pour charger plus
              </div>
            </div>`,
          key: '__load_more__',
          path: parentPath,
          data: {
            _isLoadMore: true,
            _remainingCount: remainingCount,
            _currentCount: newEndIndex,
            _totalCount: totalCount,
            _isArray: isArray,
            _parentPath: parentPath
          }
        };
        this.editor.create_node(parentNode.id, newLoadMoreNode, 'last');
      }

      // Keep the parent node open
      this.editor.open_node(parentNode.id);
    }.bind(this);

    this.jsonToJsTree = function (data, key, path) {
      // console.log('tree Generation', data, key);
      // Calculate newPath: if key exists, append to path; otherwise use '$' for root
      let newPath;
      if (key !== undefined && key !== null) {
        newPath = path ? [path, key].join('.') : key.toString();
      } else {
        // Root level - use '$' as root identifier
        newPath = path || '$';
      }
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
                <div class="menuAvailable" data-property="${prefix}" data-path="${newPath}" data-type="property">${prefix}</div>
                <div>&nbsp;${separator}&nbsp;</div>
                <div>${openingChar}${size.toString()}${closingChar}</div>
              </div>`,
            key : prefix,
            data: data,
            path: newPath,
            children: []
          }
          let showDataLenght = 100;
          let hasMoreData = false;
          let totalCount = 0;
          
          if (Array.isArray(data)) {
            totalCount = data.length;
            hasMoreData = data.length > showDataLenght;
          } else {
            totalCount = Object.keys(data).length;
            hasMoreData = totalCount > showDataLenght;
          }
          
          // Store pagination info in cache if there's more data
          if (hasMoreData) {
            this.paginationCache.set(newPath, {
              fullData: data,
              totalCount: totalCount,
              currentDisplayed: showDataLenght,
              isArray: Array.isArray(data)
            });
          }
          
          let keyCounter=0;
          for (let key in data) {
            keyCounter++;
            
            if(keyCounter<=showDataLenght){
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
          
          // Add "load more" node if there are hidden items
          if (hasMoreData) {
            let remainingCount = totalCount - showDataLenght;
            node.children.push({
              text: `<div style="display:flex;flex-direction:row;align-items:center;cursor:pointer;color:#0066cc;">
                  <div class="load-more-node" data-path="${newPath}" data-remaining="${remainingCount}" data-is-array="${Array.isArray(data)}">
                    ⋯ ${remainingCount} ${Array.isArray(data) ? 'éléments' : 'propriétés'} masqué(s) - Cliquer pour charger plus
                  </div>
                </div>`,
              key: '__load_more__',
              path: newPath,
              data: {
                _isLoadMore: true,
                _remainingCount: remainingCount,
                _currentCount: showDataLenght,
                _totalCount: totalCount,
                _isArray: Array.isArray(data),
                _parentPath: newPath
              }
            });
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
              <div class="menuAvailable" data-property="${prefix}" data-path="${newPath}" data-type="property">${prefix}</div>
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

      // Helper function to get deep object data from a jstree node
      const getDeepObjectData = (nodeData, nodePath) => {
        // If node has _frag or _file, it's a lazy-loaded node - return as-is
        if (nodeData && (nodeData._frag || nodeData._file)) {
          return nodeData;
        }
        // If it's a primitive value or null, return as-is
        if (nodeData === null || nodeData === undefined || typeof nodeData !== 'object') {
          return nodeData;
        }
        // Check if we have full data in pagination cache (for paginated objects with >100 items)
        if (nodePath && this.paginationCache.has(nodePath)) {
          const cacheEntry = this.paginationCache.get(nodePath);
          if (cacheEntry && cacheEntry.fullData) {
            return cacheEntry.fullData;
          }
        }
        // Return the full object data
        return nodeData;
      };

      // Helper function to find jstree node from DOM element
      const findJsTreeNode = (element) => {
        let anchor = element;
        while (anchor && !anchor.classList.contains('jstree-anchor')) {
          anchor = anchor.parentElement;
          if (anchor && anchor.id === 'jsonfrageditor') {
            return null;
          }
        }
        if (anchor && this.editor) {
          try {
            return this.editor.get_node(anchor);
          } catch (e) {
            return null;
          }
        }
        return null;
      };

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

          // Add "copy deep object" option for object/array nodes
          const jsTreeNode = findJsTreeNode(target);
          if (jsTreeNode && jsTreeNode.data && typeof jsTreeNode.data === 'object') {
            const nodePath = jsTreeNode.original ? jsTreeNode.original.path : null;
            const deepData = getDeepObjectData(jsTreeNode.data, nodePath);
            if (deepData && typeof deepData === 'object' && !deepData._frag && !deepData._file) {
              menus.push({
                content: JSON.stringify(deepData, null, 2),
                text: 'copy deep object',
                type: 'copy'
              })
            }
          }

          showContextMenu(e,menus);
        }
      };

      this.clickListener = (e) => {
        const target= e.target;
        
        // Check if clicking on load-more node
        let loadMoreTarget = target;
        while (loadMoreTarget && !loadMoreTarget.classList.contains('load-more-node')) {
          loadMoreTarget = loadMoreTarget.parentElement;
        }
        
        if (loadMoreTarget && loadMoreTarget.classList.contains('load-more-node')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find the jstree anchor
          let anchor = loadMoreTarget;
          while (anchor && !anchor.classList.contains('jstree-anchor')) {
            anchor = anchor.parentElement;
            if (anchor && anchor.id === 'jsonfrageditor') {
              // We've reached the root without finding the anchor
              console.error('Could not find jstree anchor');
              return;
            }
          }
          
          if (anchor) {
            try {
              const node = this.editor.get_node(anchor);
              if (node && node.id) {
                const nodeId = node.id;
                this.showLoadMoreDialog(nodeId);
              } else {
                console.error('Node not found for anchor:', anchor);
              }
            } catch (error) {
              console.error('Error getting node:', error);
            }
          }
          return;
        }
        
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
    
    /* Popup styles */
    .load-more-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    
    .load-more-popup {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      width: 400px;
      max-width: 90%;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 10px;
    }
    
    .popup-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2em;
    }
    
    .close-button {
      cursor: pointer;
      font-size: 1.8em;
      line-height: 1;
      color: #999;
      transition: color 0.2s;
    }
    
    .close-button:hover {
      color: #333;
    }
    
    .popup-content {
      margin-bottom: 20px;
    }
    
    .popup-content p {
      margin-bottom: 15px;
      color: #555;
    }
    
    .popup-content label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }
    
    .popup-content input {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
      box-sizing: border-box;
    }
    
    .popup-content input:focus {
      outline: none;
      border-color: #0066cc;
    }
    
    .popup-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .popup-actions button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #0066cc;
      color: white;
      font-size: 1em;
      transition: background-color 0.2s;
    }
    
    .popup-actions button:hover {
      background-color: #0052a3;
    }
    
    .load-more-node {
      cursor: pointer;
      user-select: none;
    }
    
    .load-more-node:hover {
      text-decoration: underline;
    }
  </style>

</jsonfragviewer>
