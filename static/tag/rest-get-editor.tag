<rest-get-editor style="justify-content:center; align-items: center;">
  <!-- Titre du composant -->
  <div class="contenaireV title-component">REST GET HTTP</div>
  <!-- Description du composant -->
  <label style="padding-top: 10px;">Intéroger un fichier mis à disposition sur une API REST avec une requete Get</label>
  <!-- Champ du composant -->
  <label style="padding-top: 10px;">url du web service à intéroger</label>
  <input class="field" style="width:600px;"placeholder="champ libre"type="text" ref="urlInput" onChange={changeUrl} value={data.specificData.url}></input>
  <label style="padding-top: 10px;">content-type</label>
  <input class="field" style="width:600px;"placeholder="champ libre"type="text" ref="contentTypeInput" onChange={changeContentType} value={data.specificData? data.specificData.contentType : "test" }></input>

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
