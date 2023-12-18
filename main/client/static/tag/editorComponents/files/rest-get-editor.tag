<rest-get-editor>
  <!-- bouton aide -->
  <div class="containerH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-File-consumer" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>
 <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <div>
    <div class="bar"/>
  </div>
  <!-- Champ du composant -->

  <label class="labelFormStandard">URL du web service à interroger:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder=""type="text" ref="urlInput" onChange={changeUrl} value={data.specificData.url}></input>
  </div>
  <label class="labelFormStandard">Content-type:</label>
  <div class="cardInput">
    <input class="inputComponents" placeholder=""type="text" ref="contentTypeInput" onChange={changeContentType} value={data.specificData? data.specificData.contentType : "test" }></input>
  </div>

  <script>
    this.data = {}
    this.data.specificData = {}
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate
      this.update();
    }.bind(this);
    changeUrl(e) {
      console.log(e)
      if (this.data != null && this.data.specificData != null) {
        this.data.specificData.url = e.currentTarget.value;
        console.log("if", this.data.specificData.url)
      } else {
        this.data = {}
        this.data.specificData = {}
        this.data.specificData.url = e.currentTarget.value;
        console.log("else", this.data.specificData.url)
      }
      this.update();
    }
    changeVerb(e) {
      this.data.specificData.verb = e.currentTarget.value;
    }
    changeBody(e) {
      this.data.specificData.body = e.currentTarget.value;
    }
    changeContentType(e) {
      console.log(e)
      if (this.data != null && this.data.specificData != null) {
        this.data.specificData.contentType = e.currentTarget.value;
        console.log("if", this.data.specificData.contentType)
      }
      this.update();
    }
    this.on('mount', function () {
      RiotControl.on('item_current_changed', this.updateData);
    }.bind(this));

    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</rest-get-editor>
