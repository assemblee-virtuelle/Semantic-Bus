<simpleTest>
  <div>{title}</div>
  <div>{testObj.val}</div>
  <div>{testObj.deep2.val}</div>

  <div id="testButton">test</div>

 <script>

    this.title='init';
    this.testObj={val:'deep1',deep2:{val:'deep2'}}
   //this=new Proxy(this, updator);

   this.on('mount', function () {
     console.log('mount',this);
     //this.items.push({attr1:10,attr2:20,attr3:30});
     //this.data=[{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3}]
     //this.data.push({attr1:10,attr2:20,attr3:30});
     //this.jsonData=[{attr1:0,attr2:0,attr3:0},{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3},{attr1:1,attr2:2,attr3:3}]
     //this.update();
     console.log(this.data);

     this.root.querySelector('#testButton').addEventListener('click',function(e){
       console.log(this.title);
        this.update({title:'ca m enerve'})
       //this.title='ca m enerve'
       console.log('test');
       //this.data.push({attr1:10,attr2:20,attr3:30});
       //this.update();
       console.log(this.title);
     }.bind(this));
   });
  </script>

</simpleTest>
