<httpQuerier>
  <h3>HTTP Querier</h3>
  <div id="search">
    <div id="searchInputContainer" class="inlineBlockDisplay"><input type="text" id="searchInput"/></div>
    <div class="inlineBlockDisplay" id="searchButton"></div>
    <span id="error" class="inlineBlockDisplay"></span>
  </div>

 <script>
   this.on('mount', function () {
    this.root.querySelector('#searchButton').addEventListener('click',function(e){
      //this.root.querySelector('#response').empty();
      this.root.querySelector('#error').textContent='pending';


      var url= this.root.querySelector('#searchInput').value;

      function callback(data){
            console.log('callback jsonp')
            alert(data.responseData.results) //showing results data
            $.each(data.responseData.results,function(i,rows){
               alert(rows.url); //showing  results url
            });
       }

      $.ajax({
        url:url,
        dataType: 'json',
      }).done(function(data){
        /*this.trigger('jsonDataReady',data);*/
        RiotControl.trigger('previewJSON',data)
        this.root.querySelector('#error').textContent='success';
      }.bind(this)).fail(function(error,text) {
        console.log(error,text);
        this.root.querySelector('#error').textContent=text;
      }.bind(this));
/*
      function fetchStatus(response) {
        if (response.status >= 200 && response.status < 300) {
          console.log('1');
          return Promise.resolve(response)
        } else {
          return Promise.reject(new Error(response.statusText))
        }
      }

      function fetchJson(response) {
        console.log('2');
        return response.json()
      }

      fetch(url,{mode: 'cors'}).then(fetchStatus).then(fetchJson)
        .then(function(data) {
          //console.log('Request succeeded with JSON response', data);
          this.trigger('jsonDataReady',data);
          error.textContent='success';
        }.bind(this))
        .catch(function(err) {
          error.textContent=err;
        });
        */
    }.bind(this));

   });

  </script>
  <style>
  #search{
    width:100%;
  }

  #searchInputContainer{
      width:80%;
  }

  #searchInput{
    font-size: 1.5em;
    width:100%;
    box-sizing: border-box;
  }
  #searchButton{
    width: 30px;
    height:30px;
    background-image: url(./image/search.png);
    background-size:100%;
    background-repeat: no-repeat;
    background-position: center;
    margin: 5px;
  }
  .inlineBlockDisplay{
    display: inline-block;
    vertical-align: top;
  }
  </style>

</httpQuerier>
