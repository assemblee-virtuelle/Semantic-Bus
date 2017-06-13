<ldpTranslation class="containerV">

  <zenTable style="flex:1" >
    <yield to="header">
      <div>nom</div>
      <div>description</div>
      <div>adresse</div>
      <div>categorie</div>
      <div>tags</div>
    </yield>
    <yield to="row">
      <div>{name}</div>
      <div>{description}</div>
      <div>{adresse}</div>
      <div>{taxonomie}</div>
      <div>{tags}</div>
    </yield>
  </zenTable>

 <script>
    refresh(){
      $.ajax({
        method:'get',
        url:'../data/testLdp',
        headers: {
          "Authorization": "JTW" + " " + localStorage.token
        },
      }).done(function(data){
        /*var compileData= [];
        for(source of data['@graph']){
          compileData = compileData.concat({name:source['@id']});
        }*/
        //this.tags.zentable.data=compileData
        /*compileData.sort(function(a,b){
          var comp=true;
          console.log(a.theme);
          if(a.theme!=null){
            comp = a.theme>b.theme;
          }
          return comp;
        });*/
        console.log(data);
        this.tags.zentable.data=data;
      }.bind(this));
    }

    this.on('mount', function () {
      //this.tags.zentable.data.push({source:'toto',initiative:'tata',thème:'titi'});
      this.refresh();
   });
  </script>
  <style>
    body{
      font-size: 2em;
      font-weight: bold;
    }
  </style>
</ldpTranslation>
