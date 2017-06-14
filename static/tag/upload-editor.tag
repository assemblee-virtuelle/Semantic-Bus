<upload-editor>
  <h2 class="center margin-top">Uploader votre fichier</h2>
  <h4 class="center">Ce composant vous permet d'uploader un fichier avec </br>une extension <b>XLSX</b> ou <b>CSV</b> et de le mapper en <b>JSON</b></h4>
  <!-- <div class="progress">
    <progress value="{progress}" min="0" max="100">{progress} %</progress>
  </div> -->
  <h3 class="{textloadclass}">{textload}</h3>
  <button class="upload-btn"  onclick = {uploadClick} type="button">Telecharger</button>
  <input id="upload-input" type="file" name="uploads[]"></br>
  <style scope>
    upload {
      height: 100%;
      background-color: #4791D2;
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
      margin-top: 10%;  
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
    this.progress = 0;
    var regex = /\.([^.]+)/g;
    this.refuse = "";
    this.accept ="";
    

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

      uploadClick() {
          $('#upload-input').click();
          $('#upload-input').on('change', function(e){
            var files = e.currentTarget.files;
            console.log(e);
            var size = e.currentTarget.files.size;
            if (files.length > 0){           
              var formData = new FormData();
              for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log(file)
                formData.append("uploads[]", file, file.name);
              }
              if(formData.getAll("uploads[]")[0].name.match(regex) == ".csv" || formData.getAll("uploads[]")[0].name.match(regex) == ".xlsx" ){
                console.log(formData.getAll("uploads[]")[0].name);   
                RiotControl.trigger('item_current_upload', formData);
                this.textload = "Votre fichier  " + formData.getAll("uploads[]")[0].name + "  est chargé";
                this.textloadclass = "yes-text"
                this.update();
              }else{
                console.log("this.refuse",this.refuse )
                this.textload = "Le format " + formData.getAll("uploads[]")[0].name.match(regex) + " n'est pas encore pris en compte"
                this.textloadclass = "no-text"
                console.log("this.refuse", this.refuse )
                this.update();
              }
            }
        }.bind(this))
      }.bind(this)
    this.on('mount', function () {
      RiotControl.on('item_current_changed',function(data){
          this.innerData=data;
          this.update();
        }.bind(this));
    });
  </script>
</upload-editor>
