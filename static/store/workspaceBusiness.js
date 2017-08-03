function WorkspaceBusiness() {
  this.connectWorkspaceComponent = function(workspaceComponentsList) {
    var workspaceComponentsListDictionnary = {};
    workspaceComponentsList=workspaceComponentsList||[];
    for (var workspaceComponent of workspaceComponentsList) {
      workspaceComponentsListDictionnary[workspaceComponent._id.$oid] = workspaceComponent;
    }

    for (workspaceComponentKey in workspaceComponentsListDictionnary) {
      var workspaceComponent = workspaceComponentsListDictionnary[workspaceComponentKey];
      var connectionsAfter = [];
      if (workspaceComponent.connectionsAfter != undefined) {
        for (connectionAfter of workspaceComponent.connectionsAfter) {
          if (workspaceComponentsListDictionnary[connectionAfter] != undefined) {
            connectionsAfter.push(workspaceComponentsListDictionnary[connectionAfter]);
          }
        }
      }
      workspaceComponent.connectionsAfter = connectionsAfter;

      var connectionsBefore = [];
      if (workspaceComponent.connectionsBefore != undefined) {
        for (connectionBefore of workspaceComponent.connectionsBefore) {
          if (workspaceComponentsListDictionnary[connectionBefore] != undefined) {
            connectionsBefore.push(workspaceComponentsListDictionnary[connectionBefore]);
          }
        }
      }
      workspaceComponent.connectionsBefore = connectionsBefore;
    }

    var out = [];
    for (workspaceComponentKey in workspaceComponentsListDictionnary) {
      out.push(workspaceComponentsListDictionnary[workspaceComponentKey]);
    }
    return out;
  };

  
  this.serialiseWorkspaceComponent = function(workspaceComponentIn) {
    //build a deep copy
    // var workspaceComponent = {
    //   _id: workspaceComponentIn._id,
    //   module: workspaceComponentIn.module,
    //   type: workspaceComponentIn.type,
    //   name: workspaceComponentIn.name,
    //   description: workspaceComponentIn.description,
    //   editor: workspaceComponentIn.editor,
    //   workspaceId: workspaceComponentIn.workspaceId,
    //   specificData: workspaceComponentIn.specificData,

    // }
    // var connectionsAfter = [];
    // if (workspaceComponentIn.connectionsAfter != undefined) {
    //   workspaceComponentIn.connectionsAfter.forEach(ConnAfter => {
    //     connectionsAfter.push(ConnAfter._id.$oid)
    //   });
    // }
    // workspaceComponent.connectionsAfter = connectionsAfter;

    // var connectionsBefore = [];
    if(workspaceComponentIn._id){
      workspaceComponentIn = workspaceComponentIn._id
      return true;
    }
    // return workspaceComponentIn;
  }

  this.serialiseWorkspace = function(workspaceIn) {
    console.log('serialiseWorkspace | ', workspaceIn);
    var components = [];
    var out = {
      _id: workspaceIn._id,
      name: workspaceIn.name,
      description: workspaceIn.description,
      average_consumption: workspaceIn.average_consumption,
      flow_size: workspaceIn.flow_size
    }
    for (component of workspaceIn.components) {
      if(this.serialiseWorkspaceComponent(component)){
        components.push(component._id);
      }
    }
    out.components = components;
    console.log('serialiseWorkspace | out | ',out);
    return out;

  }
}
