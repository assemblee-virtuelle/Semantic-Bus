<crawler-editor>
    <div>Information à propos du crawleur</div>
    <label>mot recherché</label>
    <input type="text" name="recherche" value={data.specificData.recherche}></input>
    <label>url de depart</label>
    <input type="text" name="urlDepart" value={data.specificData.urlDepart}></input>
    <label>limit nombre de page</label>
    <input type="text" name="nombrePage" value={data.specificData.nombrePage}></input>
    <script>
        this.innerData={};
        this.test=function(){
            console.log('test');
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
            this.recherche.addEventListener('change',function(e){
                this.innerData.specificData.recherche = e.currentTarget.value;
            }.bind(this));

            this.nombrePage.addEventListener('change',function(e){
                this.innerData.specificData.nombrePage = e.currentTarget.value;
            }.bind(this));

            this.urlDepart.addEventListener('change',function(e){
                this.innerData.specificData.urlDepart = e.currentTarget.value;
            }.bind(this));

            RiotControl.on('item_current_changed',function(data){
                this.innerData=data;
                this.update();
            }.bind(this));
        });
    </script>
</crawler-editor>
