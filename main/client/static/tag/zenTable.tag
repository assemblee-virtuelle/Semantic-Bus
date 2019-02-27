<zentable class="containerV {opts.zentableClass}" style="flex-grow:1;">
  <!-- header -->
  <div class="containerH tableHeader" ref="tableHeader" >
    <yield from="header"/>
  </div>

  <div class="containerV scrollable tableBody" ref="tableBodyContainer">
    <!--<div class="table scrollable" name="tableBody" ref="tableBody" ondragover={on_drag_over} ondrop={on_drop}>-->
    <div class="containerV rowContainer" each={indexedData} style="flex-grow:0;flex-shrink:0;">
      <div class="dropTarget" draggable="true" ondragenter={drag_enter} ondragover={drag_over} ondragleave={drag_leave} ondrop={drag_drop} data-insert="before"></div>

      <div
        class="tableRow containerH {selected:selected==true && opts.disallowselect!=true} {mainSelected:mainSelected==true && opts.disallowselect!=true}"
        data-rowid={rowId}
        data-id={_id}
        ondragstart={drag_start}
        onclick={rowClic}>
        <!-- draganddrop -->
        <div if={opts.drag} draggable="true" class="containerV" style="flex-shrink:0;justify-content: space-between; cursor: pointer;">
          <img src="./image/Super-Mono-png/PNG/sticker/icons/navigation-up-button.png" height="20px" width="20px" draggable="false">
          <img src="./image/Super-Mono-png/PNG/sticker/icons/navigation-down-button.png" height="20px" width="20px" draggable="false">
        </div>
        <!-- content -->
        <div class="containerH tableRowContent center-row" onkeyup={rowKeyUp} onchange={onChange} draggable="false">
          <yield from="row"/>
        </div>
        <!-- zone bouton -->
        <div class="containerV tableRowBtn" draggable="false"  if={!(opts.disallownavigation==true) || !(opts.disallowdelete==true)}>
          <!-- Bouton éditer -->
          <div onclick={navigationClick} if={!(opts.disallownavigation==true)} data-rowid={rowId}>
            <img class="commandButtonImage" src="./image/pencil.svg" height="20px" draggable={false}>
          </div>
          <!-- Bouton supprimer -->
          <div onclick={delRowClick} data-rowid={rowId} if={!(opts.disallowdelete==true)}>
            <img class="commandButtonImage" src="./image/trash.svg" height="20px" draggable={false}>
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

    this.data = [];
    this.background = ""

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
    .center-row {
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .dropTarget {
      flex-basis: 5px;
    }
    .rowContainer {
      width: 90%;
      flex-grow:0;
      flex-shrink:0;
    }
    .dropFocus {
      background-color: rgb(213,218,224);
      flex-basis: 40px;
    }
    .tableBody {
      word-break: break-all;
      overflow-wrap: break-word;
      align-items: center;
    }

    .commandBarTable {
      color: #3883fa;
      background-color: white;
    }

    .placeholder {
      margin: 10px;
      border-width: 2px;
      border-style: solid;
      border-radius: 4px;
      border-color: #3883fa;
    }
    /* ligne table*/
    .tableRow {
      justify-content: space-between;
      flex-shrink:0;
      background-color: white;
      border-radius: 2px;
      border: 1px solid;
      border-color: #f2f3f5;
    }
    .tableRowContent {
      justify-content: start;
      flex: 0.85;
    }

    .tableRowBtn {
      flex-direction: row;
      flex: 0.15;
      justify-content: space-evenly;
      align-items: center;
    }

    .tableHeader {
      flex-shrink:0;
      justify-content: center;
      height: 5vh;
      margin-bottom: 1vh;
    }

    .tableHeader > * {
      border-width: 1px;
    }

    .tableHeader > *:last-child {
      border-right-style: none;

    }

    .tableRow > *:last-child {
      border-right-style: none;

    }

    .selected {
      background-color: rgba(33, 150, 243,0.1) !important;      
      border-top-color: rgba(33, 150, 243,0.1) !important;
      border-top-width: 2px !important;
      border: none !important;
    }
  </style>

</zentable>
