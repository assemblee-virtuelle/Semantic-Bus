<jsonEditor class="containerV">
  <div id="jsoneditor" ref="jsoneditor" class="containerV">
  </div>
  <script>
    //var tag = this
    this.title="";
    this.option={};
    Object.defineProperty(this, "data", {
       set: function (data) {
         console.log('JsonEditor set data|',data);
         this.mountEditor().then(editor=>{
           editor.set(data);
           if(editor.options.mode!='text'){
             editor.expandAll();
           }
         });
         //this.editor.set(data);
        //  if(this.editor.options.mode!='text'){
        //    this.editor.expandAll();
        //  }
       }.bind(this),
       get: function () {
        return this.editor.get();
      }.bind(this),
      configurable: true
    });

    this.mountEditor=function(){
      return new Promise((resolve,reject)=>{
        if (this.editor==undefined){
          var options = {};

          if (this.opts.mode!=undefined){
            options.mode=this.opts.mode;
          }

          if (this.opts.modes!=undefined){
            options.modes=JSON.parse(this.opts.modes.split("\'").join("\""));
          }
          console.log('EDITOR INTANCIATION');
          this.editor = new JSONEditor(this.refs.jsoneditor , options);
          resolve(this.editor);
        }else{
          resolve(this.editor);
        }
      });
    }

    this.on('mount', function () {

      //this.container = this.root.querySelector('#jsoneditor');




    }.bind(this));
  </script>
  <style>
    /*@import 'js/jsonEditor/dist/jsoneditor.min.css';*/
    .jsoneditor {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height : auto;
      flex-shrink :1;
    }
    .jsoneditor-outer {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height : auto;
      flex-shrink :1;
    }

    .jsoneditor-tree {
      flex-grow: 1;
      height : auto;
      flex-shrink :1;
    }
    .jsoneditor-text {
      flex-grow: 1;
      height : auto;
      flex-shrink :1;
    }
  </style>

</jsonEditor>
