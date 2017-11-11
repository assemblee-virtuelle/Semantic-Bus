<zenTable class="containerV" class={opts.zentableClass || "zentableWorkspace"} >
  <div name="tableHeader" class="tableHeader" ref="tableHeader">
    <yield from="header"/>
  </div>
  <div class="containerV" style="flex:1" name="tableBodyContainer" ref="tableBodyContainer">
    <div class="table" name="tableBody" ref="tableBody"  ondragover={on_drag_over} ondrop={on_drop}>
      <div  class="tableRow {selected:selected== true && opts.clickclass} {mainSelected:mainSelected}"  name="tableRow" dragenter={drag_enter} dragleave={drag_leave} draggable={opts.drag}  data-rowid={rowid} data-id={_id} each={indexedData}  ondragend={parent.drag_end}
      	ondragstart={parent.drag_start} onclick={rowClic}>
        <yield from="row"/>
        <div style="width:10px">
              <div onclick={delRowClick} data-rowid={rowid} if={opts.disallowdelete==true} >
                <img  class="commandButtonImage" src="./image/poubelle.png" height="15px" draggable={false}>
              </div>
              <div onclick={navigationClick} if={opts.disallownavigation==true} data-rowid={rowid} >
                <img class="commandButtonImage" src="./image/edit.png" height="15px" draggable={false}>
              </div>
        </div>
      </div>
    </div>
  </div>
  <script>

 this.Id = null

 drag_leave(e){
  this.Id = e.item
 }



 drag_enter(e){
   e.target.parentNode.parentNode.insertBefore(this.placeholder, e.target.parentNode);
 }

  
  on_drag_over(e){
    // return true; para no aceptar

  }
  
  drag_end(event){
    this.placeholder.remove();
    this.innerData.splice(this.dragged.item.rowid,1);
    this.innerData.splice(this.Id.rowid, 0, this.dragged.item);
    RiotControl.trigger('workspace_list_persist', this.dragged.item)
    this.update();
  }
  
  rowClic(e) {
    console.log("in row click", this.innerData)
    var index = parseInt(e.item.rowid)
    if(this.innerData.length > 0){
      if (!e.ctrlKey) {
          for (data of this.innerData) {
            data.selected = false;
            data.mainSelected = false;
          }
        this.innerData[index].mainSelected = true;
        let dataWithRowId = this.innerData[index];
        dataWithRowId.rowId = index;
        this.trigger('rowSelect', dataWithRowId)
      }
      var selected = this.innerData[index].selected || false;
      this.innerData[index].selected = !selected;
    }
  }
    
	drag_start(event){
    this.dragged = event;
    return true;
  }

    var arrayChangeHandler = {
      tag: this,
      get: function (target, property, third, fourth) {
        switch (property) {
          case 'push':
          case 'unshift':
            return function (data) {
              target[property](data);
              console.log('update')
              this.tag.update();
            }.bind(this);
            break;
          default:
            return target[property];
        }
      },
      set: function (target, property, value, receiver) {
        //console.log('setting ' + property + ' for ' + target + ' with value ' + value);
        target[property] = value;
        // you have to return true to accept the changes
        return true;
      }
    };

    //  this.innerData = new Proxy([], arrayChangeHandler);

    this.innerData = [];
    this.background = ""
    //arrayChangeHandler.tag=this;
    Object.defineProperty(this, 'data', {
      set: function (data) {
        //this.innerData=new Proxy(data, arrayChangeHandler);
        this.innerData = data;
        this.update();
        //this.reportCss(); this.reportFlex(); console.log(this.items,data);
      }.bind(this),
      get: function () {
        return this.innerData;
      },
      configurable: true
    });


    Object.defineProperty(this, 'indexedData', {
      get: function () {
        var recordId = 0;
        for (record of this.innerData) {
            record.rowid = recordId++;
            record.opts = this.opts;
        }
        return this.innerData;
      }.bind(this),
      configurable: true
    });

    navigationClick(e) {
      console.log("test", e.item)
      var index = parseInt(e.item.rowid);
      let dataWithRowId = this.innerData[index];
      dataWithRowId.rowId = index;
      console.log(dataWithRowId)
      this.trigger('rowNavigation', dataWithRowId)
    }

    addRowClick(e) {
      //var index=parseInt(e.currentTarget.dataset.rowid) console.log(index);
      this.trigger('addRow')
    }

    delRowClick(e) {
      let i = 0;
      for (data of this.innerData) {
        if (data.selected) {
          console.log("in del row scrapper", data)
          let dataWithRowId = data;
          dataWithRowId.rowId = i;
          this.trigger('delRow', data)
        }
        i++
      }
    }

    cancelClick(e) {
      for (data of this.innerData) {
        data.selected = false;
      }
      this.trigger('cancel');
    }
    actionClick(e) {
      let i = 0;
      let selectedData = [];

      for (data of this.innerData) {
        if (data.selected) {
          let dataWithRowId = data;
          dataWithRowId.rowId = i;
          selectedData.push(data);
        }
        i++
      }
      this.trigger('action', selectedData);
    }

    recalculateHeader() {
      console.log(this.refs.tableHeader)
      var headers = this.refs.tableHeader.children;
      for (var row of this.root.querySelectorAll('.tableRow')) {
        for (var headerkey in headers) {
          var numkey = parseInt(headerkey);
          if (!isNaN(numkey)) {
            //console.log(row.children[numkey].getBoundingClientRect().width);
            var width = row.children[numkey].getBoundingClientRect().width;
            var cssWidth = width + 'px';
            headers[headerkey].style.width = cssWidth ;
            headers[headerkey].style.maxWidth = cssWidth ;
            headers[headerkey].style.minWidth = cssWidth ;
            headers[headerkey].style.flexBasis = cssWidth ;
            //console.log(headers[headerkey].style);
          }
        }
        break;
      }
    }

    this.on('mount', function () {
      this.placeholder=document.createElement("div");
      this.placeholder.className = "placeholder";
      //this.reportCss();
      addResizeListener(this.refs.tableBody, function () {
        this.recalculateHeader()
      }.bind(this));
      this.refs.tableBodyContainer.addEventListener('scroll', function (e) {
        //console.log(this.tableBodyContainer.scrollLeft);
        this.refs.tableHeader.scrollLeft = this.refs.tableBodyContainer.scrollLeft;
      }.bind(this));
    });
  </script>
  <style>
    [draggable] {
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    /* Required to make elements draggable in old WebKit */
    -khtml-user-drag: element;
    -webkit-user-drag: element;
    }
    .commandBarTable {
      color: #3883fa;
      background-color: white;
    }
    .table {
      display: table;
      /*display: flex;
      flex-direction: column;*/
      width: 100%;
    }
    .tableHeader {
      display: flex;
      overflow-x: hidden;
      color: rgb(110,110,110);

    }


    .tableRow{
      background-color: white;
    }


    .placeholder{
      margin:4px;
      margin-left:10px;
      border-width:2px;
      border-style:solid;
      border-radius:4px;
      border-color:#3883fa;
  }

    .tableRow {

      background-color: white;
      margin-top: 9pt;
      border-radius: 10px;
      padding: 8pt;
      color: rgb(110,110,110);
    }

    .tableHeader > * {
      /*display: inline-block;*/
      overflow: hidden;
      padding: 10px;
      border-width: 1px;
    }
    .tableHeader > *:last-child {
      border-right-style: none;
    }

    .tableRow > * {
      display: table-cell;
    }
    .tableRow > *:last-child {
      border-right-style: none;
    }

    .tableHeader {
    }

  </style>

</zenTable>
