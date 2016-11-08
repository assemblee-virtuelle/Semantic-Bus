<simple-agregator-editor>
  <div>agrégateur de flux</div>

  <script>

    this.innerData={};
    this.test=function(){
      consol.log('test');
    }

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
</simple-agregator-editor>
