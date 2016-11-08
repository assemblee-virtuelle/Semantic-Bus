<testMountContainer>

  <div class="containerH" style="bottom:0;top:0;right:0;left:0;position:absolute;">
    <div class="containerV" style="flex-basis:20%">
      <div name="workspaceSelector" class="mainSelector" style="flex-basis:100px"><div>mount</div></div>
      <div name="technicalComponentSelector" class="mainSelector" style="flex-basis:100px"><div>unmount</div></div>
    </div>
    <div class="dynamicMount" name="dynamicMount" style="flex-basis:30%">
      <div id="dynamicMount1" name="dynamicMount1"></div>
      <!--
      <testMountComponent  id="testMountComponentId" name="testMountComponent"></testMountComponent>
      <testMountComponent2  id="testMountComponent2Id" name="testMountComponent2"></testMountComponent2>
-->
    </div>
    <div style="flex-basis:40%"></div>

  </div>

  <script>

  this.cleanNavigation = function(){
    var nameList=[];
    for(child of this.dynamicMount.children){
      var name = child.getAttribute('name');
      nameList.push(name);
    }

    for(name of nameList){
      console.log('child : ',name,this.tags[name]);
      this.tags[name].unmount();
    }
  }.bind(this);


  this.on('mount', function () {
    this.workspaceSelector.addEventListener('click',function(e){
        //this.cleanNavigation();
        /*riot.mount('#testMountComponentId');*/
        /*riot.mount('#dynamicMount1','testMountComponent');*/
        //console.log(this.tags.dynamicMount1);
         this.tagsDyn =riot.mount("#dynamicMount1", 'test-mount-component')[0];
         //this.update();
        //this.tags.workspaceNavigator.isMounted=true;
        console.log(this.tagsDyn);
    }.bind(this));

    this.technicalComponentSelector.addEventListener('click',function(e){
        console.log(this.tagsDyn);
         this.tagsDyn.unmount(true);
    }.bind(this));

    //this.cleanNavigation();


  });
  </script>
  <style>

  </style>
</testMountContainer>
