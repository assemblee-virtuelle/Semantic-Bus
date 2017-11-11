<rest-api-post-editor>
  <div>description de l'api POST</div>
  <label>key</label>
  <input type="text" name="urlInput" ref="urlInput" onChange={urlInputChanged} value={data.specificData.url}></input>
  <label>url</label>
  <a ref="link" href={'http://semantic-bus.org/data/api/' +data.specificData.url}>{'http://semantic-bus.org/data/api/'+data.specificData.url}</a>
  <label>content-type</label>
  <input type="text" name="contentTypeInput" ref="contentTypeInput" onChange={contentTypeInputChanged} value={data.specificData.contentType}></input>
  <!--<label>Sortie en xls (Boolean)</label>
  <input type="text" name="xlsInput" ref="xlsInput"value={data.specificData.xls}></input>-->
  <script>

    this.data = {};
    this.test = function () {
      consol.log('test');
    }

    // Object.defineProperty(this, 'data', {    set: function (data) {      this.innerData=data;      this.update();    }.bind(this),    get: function () {     return this.innerData;   },   configurable: true });

    urlInputChanged(e) {
      this.data.specificData.url = e.currentTarget.value;
    }
    contentTypeInputChanged(e) {
      this.data.specificData.contentType = e.currentTarget.value;
    }
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    this.on('mount', function () {
      // this.refs.urlInput.addEventListener('change',function(e){   this.data.specificData.url=e.currentTarget.value; }.bind(this));
      //
      // this.refs.contentTypeInput.addEventListener('change',function(e){   this.data.specificData.contentType=e.currentTarget.value; }.bind(this));
      //
      // this.refs.xlsInput.addEventListener('change',function(e){   this.data.specificData.xls =e.currentTarget.value; }.bind(this));

      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</rest-api-post-editor>
