<workspace-editor>
  <!--<div class="containerV" style="flex-grow:1">-->
    <div class="commandBar containerH">
      <div class="containerH commandGroup">
          <div onclick={editClick}  class="commandButton" if={innerData.mode=="read"}>
            edit
          </div>
          <div onclick={cancelClick}  class="commandButton" if={innerData.mode=="edit" || innerData.mode=="init"}>
            cancel
          </div>
          <div onclick={saveClick}  class="commandButton" if={innerData.mode=="edit" || innerData.mode=="init"}>
            save
          </div>
      </div>
    </div>
    <div>
      <input readonly={innerData.mode=="read"} class={readOnly : innerData.mode=="read"} name="workspaceNameInput" type="text" placeholder="nom du workspace" value="{innerData.name}"></input>
      <input readonly={innerData.mode=="read"} class={readOnly : innerData.mode=="read"} name="workspaceDescriptionInput" type="text" placeholder="description du workspace" value="{innerData.description}"></input>
      <zenTable show={innerData.mode!="read"} title="composants" name="workspaceComponents" style="flex:1">
        <yield to="header" >
          <div>type</div>
          <div>description</div>
        </yield>
        <yield to="row">
          <div style="width:20%">{type}</div>
          <div style="width:50%">{description}</div>
          <div style="width:20%">{name}</div>
        </yield>
      </zenTable>
      <!--<span>composant d'initialisation : </span>
      <span>{innerData.firstComponent.type} : {innerData.firstComponent.desription}</span>-->

      <div class="containerH" show={innerData.mode=="read"}>
        <div class="containerV" style="flex-grow:1">
          <div class="commandBar containerH">
            <div class="commandTitle">
              composants
            </div>
          </div>
          <div class="containerV" style="flex-grow:1">
            <div class="selector" each={innerData.components} onclick={componentClick}>
              {type} : {name}
            </div>
          </div>
        </div>
      </div>
    </div>
  <!--</div>-->
<script>
  this.innerData={}
  this.title = "Workspace"

  this.persist=function(){
    this.persistClick();
  }

  this.persistClick = function(e){
    //console.log(this.tags.workspaceName);
    RiotControl.trigger('workspace_current_updateField',{field:'name',data:this.innerData.name});
    RiotControl.trigger('workspace_current_updateField',{field:'description',data:this.innerData.description});
    RiotControl.trigger('workspace_current_persist');
  }

  editClick(e){
    //console.log('EDIT');
    RiotControl.trigger('workspace_current_edit');
  }

  cancelClick(e){
    RiotControl.trigger('workspace_current_cancel');
  }

  componentClick(e){
    //console.log(e.item);
    RiotControl.trigger('item_current_click',e.item);


  }

  this.on('mount', function () {
    //console.log('workspaceEditor mount');
    this.tags.workspaceComponents.on('addRow',function(message){
      RiotControl.trigger('workspace_current_add_component',message);

    }.bind(this));
    this.tags.workspaceComponents.on('delRow',function(message){
      RiotControl.trigger('workspace_current_delete_component',message);
    }.bind(this));


    RiotControl.on('workspace_current_changed',function(data){
      console.log('workspace-editor; change model : ',data);
      this.innerData=data;
      this.tags.workspaceComponents.data=data.components;
      this.update();
    }.bind(this));

    this.workspaceNameInput.addEventListener('change',function(e){
      this.innerData.name=e.currentTarget.value;
    }.bind(this));

    this.workspaceDescriptionInput.addEventListener('change',function(e){
      this.innerData.description=e.currentTarget.value;
    }.bind(this));

    //RiotControl.trigger('workspace_current_refresh');


  });
</script>

</workspace-editor>
