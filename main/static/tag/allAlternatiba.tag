<allAlternatiba>

 <zenTable>
   <div style="width:400px">{source}</div>
   <div>{initiative}</div>
   <div>{theme}</div>
 </zenTable>

 <script>
    refresh(){
      $.ajax({
        method:'get',
        url:'../data/query/testLdp'
      }).done(function(data){
        var compileData= [];
        for(source of data){
          compileData = compileData.concat(source.actor);
        }
        //this.tags.zentable.data=compileData
        compileData.sort(function(a,b){
          var comp=true;
          console.log(a.theme);
          if(a.theme!=null){
            comp = a.theme>b.theme;
          }
          return comp;
        });
        this.tags.zentable.data=compileData;
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
</allAlternatiba>
