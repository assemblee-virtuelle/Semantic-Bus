<upload-editor >
  <h2 class="center margin-top">Uploader votre fichier</h2>
  <h4 class="center">Ce composant vous permet d'uploader un fichier avec </br>une extension <b>XLSX</b> ou <b>CSV</b> et de le mapper en <b>JSON</b></h4>
  <div class="progress">
    <div class="progress-bar" role="progressbar">{progress}</div>
  </div>
  <div class="containerV uplaod-container" style="overflow:inherit">
    <h3 class="{textloadclass}">{textload}</h3>
    <button class="upload-btn"  onclick = {uploadClick} type="button">Telecharger</button>
    <input id="upload-input" type="file" name="uploads[]"></br>
  </div>
  <style scope>
    upload {
      height: 100%;
      background-color: #4791D2;
    }

    .upload-container {
      margin-top:10%;
    }
    .no-text {
    text-align: center ;
    color: red;
    }
    .yes-text {
    text-align: center ;
    color: green;
    }
    upload {
      text-align: center;
      font-family: 'Raleway', sans-serif;
    }
    .btn:focus, .upload-btn:focus{
      outline: 0 !important;
    }

    .margin-top {
      margin-top:15%!important;
    }


    .progress-bar {
      height: 20px;
      background-color: #3883fa;
      border-radius: 5px;
      margin-left:25%;
      text-align: center;
      font-size: 0.6em;
      color: #FA8900;
    }

    .row {
      margin-top: 80px;
    }

    .upload-btn {
      color: #ffffff;
      background-color: #F89406;
      border: none;
      padding:10px;
      border-radius: 5px 5px 5px 5px;
      text-align:center;
      max-width: 25%;
      margin-left: 35%;
    }

    .upload-btn:hover,
    .upload-btn:focus,
    .upload-btn:active,
    .upload-btn.active {
      color: #ffffff;
      background-color: #FA8900;
      border: none;
    }

    .center{
      text-align:center;
    }

    h4 {
      padding-bottom: 30px;
      color: #B8BDC1;
    }

    .glyphicon {
      font-size: 5em;
      color: #9CA3A9;
    }

    h2 {
      margin-top: 15px;
      color: #68757E;
    }

    .panel {
      padding-top: 20px;
      padding-bottom: 20px;
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
    }
  </style>
  <script>

    this.innerData = {};
    this.progress = 0 ;
    var regex = /\.([^.]+)/g;
    this.refuse = "";
    this.accept ="";
<<<<<<< HEAD
=======

>>>>>>> 93731ea22c2039b0038f48970f82bb58b3928149

      Object.defineProperty(this, 'data', {
        set: function (data) {
          this.innerData = data;
          this.update();
        }.bind(this),
        get: function () {
          return this.innerData;
        },
        configurable: true
      });


      RiotControl.on('loading',function(pourcent){
        console.log('on load')
        console.log(pourcent)
        this.progress = pourcent + '%';
        $('.progress-bar').width((pourcent/ 2 )+ '%' );
        this.update();
      }.bind(this))

      RiotControl.on('item_is_upload',function(){
        this.progress = "Votre fichier  est chargé";
        this.update();
      }.bind(this))

      uploadClick() {
        /* processing array buffers, only required for readAsArrayBuffer */
        this.progress = "";
        this.textload = "";
        $('.progress-bar').width(0 + '%');

        function fixdata(data) {
          var o = "", l = 0, w = 10240;
          for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
          o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
          return o;
        }

        var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
        $('#upload-input').unbind('change');
        $('#upload-input').click();
        $('#upload-input').on('change', function(e){
          var files = $(this).get(0).files;

          if (files.length > 0){
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
        this.progress = "";
        $('.progress-bar').width(0 + '%');
        RiotControl.on('item_current_changed',function(data){
            this.innerData=data;
            this.update();
          }.bind(this));
      });
  </script>
</upload-editor>

<!-- if (ext != ".json" && ext != ".jsonld" && ext !=".csv" && ext != ".xlsx" && ext !=  ".ttl") {
                this.textloadclass = "no-text"
                this.textload = "Le format" + ext +  "n'est pas encore pris en compte"
                this.update()
              }else if (ext == ".ttl") {
                console.log("EXT", ext)
                reader.onload = function(e) {
                  var data = e.target.result;
                  RiotControl.trigger('item_current_upload', JSON.stringify({ext: "ttl", data: data}));
                }
                reader.readAsBinaryString(f);     
              }
              else {
              reader.onload = function(e) {
                //console.log("on load")
                var data = e.target.result;
                if(ext == ".json" || ext == ".jsonld"){
                  RiotControl.trigger('item_current_upload',  data);
                }else if(ext == ".xlsx" || ext ==  ".ods" || ext ==".csv") {
                  var workbook;
                  if(rABS) {
                    //console.log("radbs");
                    /* if binary string, read with type 'binary' */
                    workbook = XLSX.read(data, {type: 'binary'});
                  } else {
                    /* if array buffer, convert to base64 */
                    console.log("xlsx ods csv");
                    var arr = fixdata(data);
                    workbook = XLSX.read(btoa(arr), {type: 'base64'});
<<<<<<< HEAD
                  } -->

                   <!-- var regex = /\.([^.]+)/g;
          var reg = new RegExp(regex, 'g');
          var files = e.currentTarget.files;
          //console.log(files)
          var size = e.currentTarget.files.size;
          /* fixdata and rABS are defined in the drag and drop example */
          var files = e.currentTarget.files;
          var i,f;
          for (i = 0; i != files.length; ++i) {
            f = files[i];
            var reader = new FileReader();
            var name = f.name;
            var ext = name.match(reg)[0];
            //console.log(reader)
             -->
=======
                  }
                  console.log(workbook);
                    RiotControl.trigger('item_current_upload', JSON.stringify({ext: "exel", data: workbook.Sheets}));
                  /* DO SOMETHING WITH workbook HERE */
                }
              }.bind(this)
              reader.readAsBinaryString(f);
            }
          }
        }.bind(this))
      }.bind(this)
    this.on('mount', function () {
      this.progress = "";
      $('.progress-bar').width(0 + '%');
      RiotControl.on('item_current_changed',function(data){
          this.innerData=data;
          this.update();
        }.bind(this));
    });
  </script>
</upload-editor>
>>>>>>> 93731ea22c2039b0038f48970f82bb58b3928149
