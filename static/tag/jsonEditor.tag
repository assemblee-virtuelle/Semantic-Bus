<jsonEditor class="containerV">
  <div id="jsoneditor" style="flex:1">
  </div>
  <script>
    //var tag = this
    this.title="";
    Object.defineProperty(this, "data", {
       set: function (data) {
         this.editor.set(data);
         if(this.editor.options.mode!='text'){
           this.editor.expandAll();   
         }

         /*this.jsonEditorReadyPromise.then(function(){
           console.log('json editor reday')
           this.editor.set(data);
           //console.log(this.editor);
           this.editor.expandAll();
         }.bind(this));*/
       }.bind(this),
       get: function () {
        return this.editor.get();
      }.bind(this)
    });

    /*this.jsonEditorReadyPromise=new Promise(function(resolve, reject) {
      var readyWait=function(){
        setTimeout(function(){
          //console.log(typeof JSONEditor);
          if (this.editor!=undefined){
            //console.log('READY');
            resolve();
          }else{
            //console.log('WAIT');
            readyWait();
          }
        }.bind(this),100);
      }.bind(this);
      readyWait();
    }.bind(this));
    */

    this.on('mount', function () {
      /*riot.compile(
      'https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js',
      function(){
        $(function(){
          this.tags.nested.parentJQueryReady();
        }.bind(this));

      }.bind(this));*/

      this.container = this.root.querySelector('#jsoneditor');

      var options = {};
      if (this.opts.mode!=undefined){
        console.log(this.opts);
        options.mode=this.opts.mode;
      }
      this.editor = new JSONEditor(this.container , options);

      /*riot.compile(
        'js/jsonEditor/dist/jsoneditor.min.js',
        function(){
          var options = {};
          if (this.opts.mode!=undefined){
            console.log(this.opts);
            options.mode=this.opts.mode;
          }
          this.editor = new JSONEditor(this.container , options);
          //console.log(this.editor)
        }.bind(this)
      );*/

    }.bind(this));
  </script>
  <style>
    /*@import 'js/jsonEditor/dist/jsoneditor.min.css';*/
    #jsoneditor{
      height: 100%;
    }
  </style>

</jsonEditor>
