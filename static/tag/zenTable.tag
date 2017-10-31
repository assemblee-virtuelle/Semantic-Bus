<zenTable class="containerV" style="align-items:stretch">
  <div class="commandBar containerH commandBarTable" style={opts.css}>
    <div></div>
    <div>{opts.title}</div>
    <div class="containerH commandGroup">

      <div onclick={addRowClick} class="commandButtonImage test-addRow" if={!opts.disallowcommand==true}><img src="./image/Super-Mono-png/PNG/basic/blue/toggle-expand-alt.png" height="40px"></div>
      <div onclick={delRowClick} class="commandButtonImage test-delRow" if={!opts.disallowcommand==true}><img src="./image/Super-Mono-png/PNG/basic/blue/toggle-collapse-alt.png" height="40px"></div>
      <div onclick={cancelClick} class="commandButton" if={opts.allowcancelcommand==true}>cancel</div>
      <div onclick={actionClick} class="commandButton" if={opts.actiontext!=undefined}>{opts.actiontext}</div>
    </div>
  </div>
  <div name="tableHeader" class="tableHeader" ref="tableHeader">
    <yield from="header"/>
  </div>
  <div class="containerV" style="flex:1" name="tableBodyContainer" ref="tableBodyContainer">
    <div class="table" name="tableBody" ref="tableBody"  ondragover={on_drag_over} ondrop={on_drop}>
      <div class="tableRow {selected:selected} {mainSelected:mainSelected}"  name="tableRow" draggable={true} onclick={rowClic} data-rowid={rowid} data-id={_id} each={i in indexedData}  ondragend={parent.drag_end}
      	ondragstart={parent.drag_start} >
        <!--  <yield from="row"/>  -->
        {i.name}
        <!--  <div style="width:10px" if={!opts.disallownavigation==true}>
          <div class="containerH commandBar">
            <div class="commandGroup containerH">
              <div onclick={navigationClick} class="commandButton" data-rowid={rowid} >
                <img src="./image/Super-Mono-png/PNG/basic/blue/arrow-right.png" height="25px" draggable={false}>
              </div>
            </div>
          </div>
        </div>  -->
      </div>
    </div>
  </div>
  <script>

 this.Id = null

  on_drop(event){ 
    console.log("---- drop ----- ")
  	var pos = 0;
    var children= this.placeholder.parentNode.children;

		for(var i=0;i<children.length;i++){
    	if(children[i]==this.placeholder) break;
    	if(children[i]!= this.dragged && children[i].classList.contains("tableRow"))
      	pos++;
    }
  	//this.movePage(this.lists,event.item.list.name,this.pageId,pos);
    this.update();
  }
  
  on_drag_over(e){
  console.log("on drag over", e.target == "tableRow  ", e.target.className)
    // return true; para no aceptar
  	if(this.dragged.style.display != "none"){
      console.log(this.dragged.style)
    	this.dragged.style.display = "none";
      this.dragged.parentNode.insertBefore(this.placeholder, this.dragged);
    }
    
    if(e.target.className != "tableRow  ")
    	return;
  
    /// PAGE ///
    if(e.target.className == "tableRow  "){
      console.log("in if")
      this.over = e.target;
      // Inside the dragOver method
      var relY = e.clientY - this.over.offsetTop;
      var height = this.over.offsetHeight / 2;
      var parent = e.target.parentNode;
      console.log(relY, height, parent)
      if(relY > height) {
        this.nodePlacement = "after";
        console.log("after")
        parent.insertBefore(this.placeholder, e.target.nextElementSibling);
      }
      else if(relY < height) {
        this.nodePlacement = "before"
        console.log("before")
        parent.insertBefore(this.placeholder, e.target);
      }
    }
    this.update()
  }
  
  drag_end(event){
    console.log("----dragend-----") 
    var pos = 0;
    var children= this.placeholder.parentNode.children;
    console.log(children)
		for(var i=0;i<children.length;i++){
    	if(children[i]== this.placeholder) break;
    	if(children[i]!= this.dragged && children[i].classList.contains("tableRow"))
      	pos++;
    }

    console.log(this.innerData, event.item.i._id ,this.Id, pos)
  	this.movePage(this.innerData, event.item.name ,this.Id,pos);
    this.update();
  	event.preventUpdate= true;
    this.dragged.style.display = "block";
    if(this.placeholder.parentNode){
    	this.placeholder.parentNode.removeChild(this.placeholder);
    }
    
  }
  
	drag_start(event){
    console.log("----drag start-----", event)
    this.dragged = event.target;
    this.Id = event.item.i._id;
    console.log("----- drag end -----", this.Id)
    return true;
  }
  
  removePage(worspaces,curentId){
    for(var j=0;worspaces && j < worspaces.length;j++){
      var workspace = worspaces[j];
      if(workspace._id == curentId){
        worspaces.splice(j,1);
        return workspace;
      }
    }       
  }
   
   movePage(worspaces,idWorkspace,curentId,pos){
   		var pageObj=this.removePage(worspaces,curentId);
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

    rowClic(e) {
      var index = parseInt(e.currentTarget.dataset.rowid)
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

    navigationClick(e) {
      var index = parseInt(e.currentTarget.dataset.rowid);
      let dataWithRowId = this.innerData[index];
      dataWithRowId.rowId = index;
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
     // addResizeListener(this.refs.tableBody, function () {
        //this.recalculateHeader()
      //}.bind(this));
      this.refs.tableBodyContainer.addEventListener('scroll', function (e) {
        //console.log(this.tableBodyContainer.scrollLeft);
        this.refs.tableHeader.scrollLeft = this.refs.tableBodyContainer.scrollLeft;
      }.bind(this));
    });
  </script>
  <style>

    .commandBarTable {
      color: #3883fa;
      background-color: white;
    }
    .table {
      display: table;
      /*display: flex;
      flex-direction: column;*/
      border-style: solid;
      border-width: 1px;
      border-color: #3883fa;
      width: 100%;
    }
    .tableHeader {
      display: flex;
      overflow-x: hidden;

    }

    .tableRow {
      display: table-row;
      /*display: flex;*/
    }
    .tableRow:nth-child(odd) {
      background-color: #cce2ff;
    }
    .tableRow.mainSelected > *,
    .tableRow.selected > *,
    .tableRow:hover > * {
      /*background-color: #3883fa;*/
      border-top-style: solid;
      border-bottom-style: solid;
      border-top-width: 3px;
      border-bottom-width: 3px;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    .tableRow.selected > * {
      border-color: grey;
    }
    .tableRow.mainSelected > *,
    .tableRow:hover > * {
      border-color: #3883fa;
    }
    .tableRow.selected > *:first-child,
    .tableRow:hover > *:first-child {
      border-left-style: solid;
      border-left-width: 3px;
      padding-left: 2px;
    }
    .tableRow.selected > *:last-child,
    .tableRow:hover > *:last-child {
      border-right-style: solid;
      border-right-width: 3px;
      padding-right: 2px;
    }

    .placeholder{
      margin:4px;
      margin-left:10px;
      border-width:2px;
      border-style:dashed;
      border-radius:4px;
      border-color:#aaa;
  }

    .tableRow {
      cursor: pointer;
    }

    .tableHeader > * {
      /*display: inline-block;*/
      overflow: hidden;
      padding: 5px;
      border-right-style: solid;
      border-width: 1px;
    }
    .tableHeader > *:last-child {
      border-right-style: none;
    }

    .tableRow > * {
      display: table-cell;
      padding: 5px;
      border-right-style: solid;
      border-width: 1px;
      border-color: grey;
    }
    .tableRow > *:last-child {
      border-right-style: none;
    }

    .tableHeader {
      color: #cce2ff;
      background-color: #3883fa;
    }

  </style>

</zenTable>
