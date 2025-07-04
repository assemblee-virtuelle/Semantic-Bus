<zentable class="containerV {opts.zentableClass}" style="flex-grow:1;">
  <!-- header -->
  <div class="containerH tableHeader" ref="tableHeader" ><yield from="header"/></div>

  <div class="containerV scrollable tableBody" ref="tableBodyContainer">
    <!--<div class="table scrollable" name="tableBody" ref="tableBody" ondragover={on_drag_over} ondrop={on_drop}>-->
    <div class="containerV rowContainer" each={indexedData} ref="rowContainer" draggable={opts.dragout} ondragstart={dragOut_start}  style="flex-grow:0;flex-shrink:0;">
      <!-- déplacer -->
      <div if={opts.drag}  class="dropTarget" draggable="true" ondragenter={drag_enter} ondragover={drag_over} ondragleave={drag_leave} ondrop={drag_drop} data-insert="before"></div>

      <div
        class="tableRow containerH {selected:selected==true && opts.disallowselect!=true} {mainSelected:mainSelected==true && opts.disallowselect!=true}"
        data-rowid={rowId}
        data-id={_id}
        ondragstart={drag_start}
        onclick={rowClic}>
        <!-- draganddrop -->
        <div if={opts.drag} draggable="true" class="containerV" style="flex-shrink:0;justify-content: space-between; cursor: pointer; width:20px">
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
          <div if={!(opts.disallownavigation==true)}>
            <a href={directNavigationUrl} if={directNavigationUrl}>  <img class="commandButtonImage" src="./image/pencil.svg" height="20px" draggable={false}></a>
            <img if={!directNavigationUrl}  onclick={navigationClick} class="commandButtonImage" src="./image/pencil.svg" height="20px" draggable={false} data-rowid={rowId}>
          </div>
          <!-- Bouton supprimer -->
          <div onclick={delRowClick} data-rowid={rowId} if={!(opts.disallowdelete==true)}>
            <img class="commandButtonImage" src="./image/trash.svg" height="20px" draggable={false}>
          </div>
        </div>
      </div>
      <!-- déplacer -->
      <div if={opts.drag}  class="dropTarget" draggable="true" ondragenter={drag_enter} ondragover={drag_over} ondragleave={drag_leave} ondrop={drag_drop} data-insert="after"></div>
    </div>

  </div>
  <script>

    this.dragItem = null
    this.data = [];
    this.background = ""

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
      event.dataTransfer.setData('sourceData', JSON.stringify(event.item));
      event.dataTransfer.setDragImage(event.target.parentElement, 0, 0);
      //console.log("drag_start"); this.dragged = event; return true;
    }


    async dragOut_start(event) {
      //console.log(event);
      RiotControl.trigger('set_componentSelectedToAdd', [event.item]);
      event.dataTransfer.setData('sourceData', JSON.stringify(event.item));
      const img = event.target.querySelector('.rowImg');
      event.dataTransfer.setDragImage(img,0,0);
    }

    drag_drop(event) {
      event.preventDefault();
      event.target.classList.remove('dropFocus');
      event.target.classList.add('dropTarget');
      let insertDirection = event.target.getAttribute('data-insert');
      //console.log("insertDirection",insertDirection);
      //console.log("item", event.item);
      //console.log("event",JSON.parse(event.dataTransfer.getData('sourceData')));
      let source = JSON.parse(event.dataTransfer.getData('sourceData'));
      //console.log('source', source);
      //console.log(event.target); this.placeholder.remove();
      //console.log('origin', this.data);
      // this.data.splice(source.rowId, 1);
      let insertPosition = event.item.rowId;
      //console.log(insertDirection);

      this.data.splice(source.rowId, 1);

      if (insertDirection == 'before') {
        insertPosition--;
      }
      if (source.rowId > insertPosition) {
        insertPosition++;
      }
      //let newData=this.data.slice(0,insertPosition)
      insertPosition = Math.max(0, insertPosition);
      //console.log(insertPosition);

      this.data.splice(insertPosition, 0, source);

      // RiotControl.trigger('workspace_list_persist', this.dragged.item)
      //console.log('result', this.data);
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


    this.on('mount', function () {
      //let rowContainer = d3.selectAll('.rowContainer');
      //console.log(this.root.querySelectorAll('.rowContainer'))
      //console.log(this.refs.rowContainer)
      //console.log('rowContainer',rowContainer);
    });


    this.on('updated', function () {
      //let rowContainer = d3.selectAll('.rowContainer');
      //console.log(this.root.querySelectorAll('.rowContainer'))
      //console.log(this.refs.rowContainer)
      //console.log('rowContainer',rowContainer);
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

    .tableHeader:empty {
      display: none;
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
