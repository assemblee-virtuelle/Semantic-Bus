<cache-nosql-editor>
  <div>mettre en cache les data et les réintoriger</div>

  <script>

    this.innerData={};

    Object.defineProperty(this, 'data', {
       set: function (data) {
         this.innerData=data;
         this.update();
       }.bind(this),
       get: function () {
        return this.innerData;
      },
      configurable: true
    });
    this.on('mount', function () {


      RiotControl.on('item_current_changed',function(data){
        this.innerData=data;

        this.update();
      }.bind(this));
    });

  </script>
</cache-nosql-editor>
