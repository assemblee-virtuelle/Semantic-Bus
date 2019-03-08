<upload-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Upload" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
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
  <h3 class="{textloadclass}">{textload}</h3>
  <div class="containerH" style="align-items: center;justify-content: center;flex-shrink:0">
    <div class="contenaireV">
      <button onclick={uploadClick} type="button" style="flex:1">Importer</button>
      <input id="upload-input" type="file" name="uploads[]">
    </div>
  </div>

  <div class="containerH" style="justify-content: center;flex-shrink:0;margin-top:20px">
    <progress max="100" value={progress} class={status} style="flex:1"></progress>
  </div>

  <style scope="scope">
    progress {
      background: white;
    }
    progress::-webkit-progress-bar {
      background: white;
    }

    progress.waiting::-webkit-progress-value {
      background: orange;
    }
    progress.resolved::-webkit-progress-value {
      background: rgb(41,171,135);
    }
    progress.error::-webkit-progress-value {
      background: red;
    }

    progress.waiting::-moz-progress-bar {
      background: orange;
    }
    progress.resolved::-moz-progress-bar {
      background: rgb(41,171,135);
    }
    progress.error::-moz-progress-bar {
      background: red;
    }

    #upload-input {
      display: none;
    }
   
  @media (min-width: 768px) {
    .main-container {
      width: 100%;
    }
  }
  @media (min-width: 992px) {
    .container {
      width: 450px;
    }
  }*/
  </style>
  <script>

    this.data = {};
    this.progress = 0;
    this.status = 'waiting';
    var regex = /\.([^.]+)/g;
    this.refuse = "";
    this.accept = "";
    //
    // Object.defineProperty(this, 'data', {   set: function (data) {     this.data = data;     this.update();   }.bind(this),   get: function () {     return this.data;   },   configurable: true });
    this.updateData = function (dataToUpdate) {
      this.data = dataToUpdate;
      this.update();
    }.bind(this);

    RiotControl.on('loading', function (pourcent) {
      this.progress = pourcent;
      //$('.progress-bar').width((pourcent / 2) + '%');
      this.update();
    }.bind(this))

    RiotControl.on('item_is_upload', function () {
      //console.log('ALLO');
      this.status = "resolved";
      this.update();
    }.bind(this))

    uploadClick() {
      /* processing array buffers, only required for readAsArrayBuffer */
      this.progress = 0;
      this.textload = "";
      //$('.progress-bar').width(0 + '%');

      function fixdata(data) {
        var o = "",
          l = 0,
          w = 10240;
        for (; l < data.byteLength / w; ++l)
          o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
      }

      var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
      $('#upload-input').unbind('change');
      $('#upload-input').click();
      $('#upload-input').on('change', function (e) {
        var files = $(this).get(0).files;
        if (files.length > 0) {
          var formData = new FormData();
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploads[]', file, file.name);
          }
          RiotControl.trigger('item_current_upload', formData);
        }
      })
    }.bind(this)
    this.on('mount', function () {
      //this.progress = ""; $('.progress-bar').width(0 + '%');
      RiotControl.on('item_current_changed', this.updateData);
    });
    this.on('unmount', function () {
      RiotControl.off('item_current_changed', this.updateData);
    });
  </script>
</upload-editor>
