<zentable class="containerV {opts.zentableClass}" style="flex-grow:1;">
  <div class="containerH tableHeader" style="justify-content:center">
    <yield from="Search"/>
  </div>
  <!-- header -->
  <div class="containerH tableHeader" ref="tableHeader" style="flex-shrink:0;">
    <yield from="header"/>
  </div>

  <div class="containerV scrollable tableBody" ref="tableBodyContainer">
    <!--<div class="table scrollable" name="tableBody" ref="tableBody" ondragover={on_drag_over} ondrop={on_drop}>-->
    <div class="containerV" each={indexedData} style="margin-right: 50px;margin-left: 50px;flex-grow:0;flex-shrink:0;">
      <div class="dropTarget" draggable="true" ondragenter={drag_enter} ondragover={drag_over} ondragleave={drag_leave} ondrop={drag_drop} data-insert="before"></div>

      <div
        class="tableRow containerH {selected:selected==true && opts.disallowselect!=true} {mainSelected:mainSelected==true && opts.disallowselect!=true}"
        data-rowid={rowId}
        data-id={_id}
        ondragstart={drag_start}
        onclick={rowClic}
        style="justify-content: space-between;flex-shrink:0;">
        <!-- draganddrop -->
        <div if={opts.drag} draggable="true" class="containerV" style="background-color:grey;flex-shrink:0;justify-content: space-between;">
          <img src="./image/Super-Mono-png/PNG/sticker/icons/navigation-up-button.png" height="20px" width="20px" draggable="false">
          <img src="./image/Super-Mono-png/PNG/sticker/icons/navigation-down-button.png" height="20px" width="20px" draggable="false">
        </div>
        <!-- content -->
        <div class="containerH tableRowContent" style="flex-grow:1" onkeyup={rowKeyUp} onchange={onChange} draggable="false">
          <yield from="row"/>
        </div>
        <!-- zone bouton -->
        <div class="containerV" style="flex-basis:120px;" draggable="false">
          <div class="containerH" style="justify-content:space-around;padding-top:10px;align-items: center;">
            <!-- Bouton éditer -->
            <div onclick={navigationClick} if={!(opts.disallownavigation==true)} data-rowid={rowId} style="flex-basis:10px;">
              <img class="commandButtonImage" src="./image/edit.png" height="20px" draggable={false}>
            </div>
            <!-- Bouton supprimer -->
            <div onclick={delRowClick} data-rowid={rowId} if={!(opts.disallowdelete==true)} style="flex-basis:10px;">
              <img class="commandButtonImage" src="./image/poubelle.png" height="20px" draggable={false}>
            </div>

          </div>
        </div>
      </div>
      <!-- déplacer un workflow -->
      <div class="dropTarget" draggable="true" ondragenter={drag_enter} ondragover={drag_over} ondragleave={drag_leave} ondrop={drag_drop} data-insert="after"></div>
    </div>

  </div>
  <script>

    this.dragItem = null

    drag_leave(e) {
      e.preventDefault();
      e.target.classList.remove('dropFocus');
      e.target.classList.add('dropTarget')
    }

    drag_enter(e) {
      e.preventDefault();
      e.target.classList.remove('dropTarget');
      e.target.classList.add('dropFocus')
    }

    drag_over(e) {
      //console.log('over');
      e.preventDefault();
    }

    drag_start(event) {
      //console.log(event.target.parentElement);
      event.dataTransfer.setData('application/json', JSON.stringify(event.item));
      event.dataTransfer.setDragImage(event.target.parentElement, 0, 0);
      //console.log("drag_start"); this.dragged = event; return true;
    }
    drag_drop(event) {
      event.preventDefault();
      event.target.classList.remove('dropFocus');
      event.target.classList.add('dropTarget');
      let insertDirection = event.target.getAttribute('data-insert');
      //console.log("insertDirection",insertDirection);
      console.log("item", event.item);
      //console.log("event",JSON.parse(event.dataTransfer.getData('application/json')));
      let source = JSON.parse(event.dataTransfer.getData('application/json'));
      console.log('source', source);
      //console.log(event.target); this.placeholder.remove();
      console.log('origin', this.data);
      // this.data.splice(source.rowId, 1);
      let insertPosition = event.item.rowId;
      console.log(insertDirection);

      this.data.splice(source.rowId, 1);

      if (insertDirection == 'before') {
        insertPosition--;
      }
      if (source.rowId > insertPosition) {
        insertPosition++;
      }
      //let newData=this.data.slice(0,insertPosition)
      insertPosition = Math.max(0, insertPosition);
      console.log(insertPosition);

      this.data.splice(insertPosition, 0, source);

      // RiotControl.trigger('workspace_list_persist', this.dragged.item)
      console.log('result', this.data);
      this.update();
    }

    //input drop can't be diseable. this stop propagation to body row_over(event) {   console.log("ROWOVER");   event.preventDefault();   event.stopPropagation(); }

    rowClic(e) {
      //console.log("in row click", this.opts)
      if (!(this.opts.disallowselect == true)) {
        //console.log('CLIC'); console.log(e.item); var index = parseInt(e.item.rowId)
        if (this.data.length > 0) {
          if (!e.ctrlKey) {
            for (data of this.data) {
              data.selected = false;
              data.mainSelected = false;
            }
            //this.data[index].mainSelected = true; this.data[index].seleted = true;
            e.item.mainSelected = true;
            e.item.selected = true;
            //let dataWithrowId = this.data[index]; dataWithrowId.rowId = index;
          } else {
            e.item.selected = !e.item.selected
            if (e.item.mainSelected == true) {
              e.item.mainSelected = false;
            }
          }
          //console.log('TRIGGER');
          this.trigger('rowsSelected', sift({
            selected: true
          }, this.data));
          //var selected = this.data[index].selected || false; this.data[index].selected = !selected;
        }
      }
    }

    // var arrayChangeHandler = {   tag: this,   get: function (target, property, third, fourth) {     switch (property) {       case 'push':       case 'unshift':         return function (data) {           target[property](data);
    // console.log('update')           this.tag.update();         }.bind(this);         break;       default:         return target[property];     }   },   set: function (target, property, value, receiver) {     console.log('setting ' + property + ' for
    // ' + target + ' with value ' + value);     target[property] = value;      you have to return true to accept the changes     return true;   } };  this.data = new Proxy([], arrayChangeHandler);

    this.data = [];
    this.background = ""
    // arrayChangeHandler.tag=this; Object.defineProperty(this, 'data', {   set: function (data) {     this.data=new Proxy(data, arrayChangeHandler);     this.data = data;     this.update();     this.reportCss(); this.reportFlex();
    // console.log(this.items,data);   }.bind(this),   get: function () {     return this.data;   },   configurable: true });

    Object.defineProperty(this, 'indexedData', {
      get: function () {
        var recordId = 0;
        for (record of this.data) {
          record.rowId = recordId++;
          record.opts = this.opts;
        }
        return this.data;
      }.bind(this),
      configurable: true
    });

    navigationClick(e) {
      //console.log("test", e.item)
      var index = parseInt(e.item.rowId);
      let dataWithrowId = this.data[index];
      dataWithrowId.rowId = index;
      //console.log(dataWithrowId)
      this.trigger('rowNavigation', dataWithrowId)
    }

    addRowClick(e) {
      //var index=parseInt(e.currentTarget.dataset.rowId) console.log(index);
      this.trigger('addRow')
    }

    delRowClick(e) {
      //console.log(e);
      if (confirm("Êtes vous sur de vouloir supprimer l'élément ?")) {
        //console.log(e.item);
        this.trigger('delRow', e.item)
      } else {
        return
      }
      // let dataWithrowId = e.item; dataWithrowId.rowId = i; this.trigger('delRow', e.item) console.log('ALLO'); let i = 0; for (data of this.data) {   if (data.selected) {     console.log("in del row scrapper", data)     let dataWithrowId = data;
      // dataWithrowId.rowId = i;     this.trigger('delRow', data)   }   i++ }
    }

    cancelClick(e) {
      for (data of this.data) {
        data.selected = false;
      }
      this.trigger('cancel');
    }
    // actionClick(e) {   let i = 0;   let selectedData = [];
    //
    //   for (data of this.data) {     if (data.selected) {       let dataWithrowId = data;       dataWithrowId.rowId = i;       selectedData.push(data);     }     i++   }   this.trigger('action', selectedData); }

    rowKeyUp(e) {
      //console.log('KEY PRESS', e);
      if (e.target.attributes['data-field'] != undefined) {
        //console.log('ALLO');
        e.item[e.target.attributes['data-field'].value] = e.target.value;
      }
      this.trigger('dataChanged', this.data)
      //console.log(this.indexedData);
    }

    onChange(e) {
      if (e.target.attributes['data-field'] != undefined) {
        //console.log('ALLO');
        e.item[e.target.attributes['data-field'].value] = e.target.value;
      }
      this.trigger('dataChanged', this.data)
    }

    // recalculateHeader() {   console.log(this.refs.tableHeader)   var headers = this.refs.tableHeader.children;   for (var row of this.root.querySelectorAll('.tableRow')) {     for (var headerkey in headers) {       var numkey = parseInt(headerkey);
    // if (!isNaN(numkey)) {         console.log(row.children[numkey].getBoundingClientRect().width);         var width = row.children[numkey].getBoundingClientRect().width;         var cssWidth = width + 'px'; headers[headerkey].style.width = cssWidth;
    // headers[headerkey].style.maxWidth = cssWidth;         headers[headerkey].style.minWidth = cssWidth;         headers[headerkey].style.flexBasis = cssWidth; console.log(headers[headerkey].style);       }     }     break;   } }

    this.on('mount', function () {
      // this.refs.tableBodyContainer.addEventListener('dragenter', e => {   console.log('dragenter');   this.drag_enter(e); }, true)
      //
      // this.refs.tableBodyContainer.addEventListener('dragover', e => {   console.log('dragover');   this.drag_over(e); }, true) this.placeholder = document.createElement("div"); this.placeholder.className = "placeholder"; this.reportCss();
      // addResizeListener(this.refs.tableBody, function () {   this.recalculateHeader() }.bind(this)); this.refs.tableBodyContainer.addEventListener('scroll', function (e) {   console.log(this.tableBodyContainer.scrollLeft);
      // this.refs.tableHeader.scrollLeft = this.refs.tableBodyContainer.scrollLeft; }.bind(this));

    });
  </script>
  <style>

    /*[draggable=true] {
      -khtml-user-drag: element;
      -webkit-user-drag: element;
    }*/
    .dropTarget {
      flex-basis: 5px;
    }
    .dropFocus {
      background-color: rgb(213,218,224);
      flex-basis: 40px;
    }
    .tableBody {
      background-color: rgb(238,242,249);
      word-break: break-all;
      overflow-wrap: break-word;
    }

    .commandBarTable {
      color: #3883fa;
      background-color: white;
    }

    /*.tableHeader {
      color: rgb(110,110,110);
      background-color: rgb(238,242,249);
      justify-content: start;
    }*/

    .placeholder {
      margin: 10px;
      border-width: 2px;
      border-style: solid;
      border-radius: 4px;
      border-color: #3883fa;
    }
    /* ligne table*/
    .tableRow {
      background-color: #ffffff;
      background-image: linear-gradient(#fff, #f2f3f5);
      border-radius: 5px;
      border-top-width: 1px;
      border-left-width: 1px;
      border-right-width: 1px;
      border-style: solid;
      border-color: #f2f3f5 rgb(213,218,224) rgb(213,218,224);

    }
    .tableRowContent {
      justify-content: start;

    }

    .tableRowContent > * {
      padding: 10px;
      border-width: 1px;

    }

    /*.tableHeader {
      padding: 8pt;
    }*/

    .tableHeader > * {
      padding: 10px;
      border-width: 1px;
    }

    .tableHeader > *:last-child {
      border-right-style: none;

    }

    .tableRow > *:last-child {
      border-right-style: none;

    }

    .selected {
      border-color: blue;
    }
  </style>

</zentable>
