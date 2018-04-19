function WorkspaceBusiness() {

  // --------------------------------------------------------------------------------

  this.connectWorkspaceComponent = function(workspaceComponentsList) {
    console.log('connectWorkspaceComponent', workspaceComponentsList);
    workspaceComponentsList.forEach(component => {

      if (component != null) {
        component.connectionsAfter = component.connectionsAfter.map(componentId => {
          let mergedId=componentId._id?componentId._id:componentId;
          return (sift({
            _id: mergedId
          }, workspaceComponentsList))[0];
        });
        component.connectionsAfter=sift({$ne:undefined},component.connectionsAfter);

        component.connectionsBefore = component.connectionsBefore.map(componentId => {
          let mergedId=componentId._id?componentId._id:componentId;
          return (sift({
            _id: mergedId
          }, workspaceComponentsList))[0];
        });
        component.connectionsBefore=sift({$ne:undefined},component.connectionsBefore);
      }
    });


    //
    // console.log("connectWorkspaceComponent", workspaceComponentsList)
    // var workspaceComponentsListDictionnary = {};
    // workspaceComponentsList = workspaceComponentsList || [];
    // for (var workspaceComponent of workspaceComponentsList) {
    //   console.log("connectWorkspaceComponent", workspaceComponent._id.$oid)
    //   workspaceComponentsListDictionnary[workspaceComponent._id.$oid] = workspaceComponent;
    // }
    //
    // for (workspaceComponentKey in workspaceComponentsListDictionnary) {
    //   var workspaceComponent = workspaceComponentsListDictionnary[workspaceComponentKey];
    //   var connectionsAfter = [];
    //   if (workspaceComponent.connectionsAfter != undefined) {
    //     for (connectionAfter of workspaceComponent.connectionsAfter) {
    //       if (workspaceComponentsListDictionnary[connectionAfter] != undefined) {
    //         connectionsAfter.push(workspaceComponentsListDictionnary[connectionAfter]);
    //       }
    //     }
    //   }
    //   workspaceComponent.connectionsAfter = connectionsAfter;
    //
    //   var connectionsBefore = [];
    //   if (workspaceComponent.connectionsBefore != undefined) {
    //     for (connectionBefore of workspaceComponent.connectionsBefore) {
    //       if (workspaceComponentsListDictionnary[connectionBefore] != undefined) {
    //         connectionsBefore.push(workspaceComponentsListDictionnary[connectionBefore]);
    //       }
    //     }
    //   }
    //   workspaceComponent.connectionsBefore = connectionsBefore;
    // }
    //
    // var out = [];
    // for (workspaceComponentKey in workspaceComponentsListDictionnary) {
    //   out.push(workspaceComponentsListDictionnary[workspaceComponentKey]);
    // }
    // return out;
  }; //<= connectWorkspaceComponent

  this.unserializeWorkspace = function(workspace) {
    console.log('connectWorkspaceComponent', workspaceComponentsList);
    this.connectWorkspaceComponent(workspace.components);
  }; //<= connectWorkspaceComponent

  // --------------------------------------------------------------------------------


  this.serialiseWorkspaceComponent = function(workspaceComponentIn) {
    if (!workspaceComponentIn.connectionsBefore) {
      workspaceComponentIn.connectionsBefore = []
    }
    if (!workspaceComponentIn.connectionsAfter) {
      workspaceComponentIn.connectionsAfter = []
    }
    var out = {
      _id: workspaceComponentIn._id,
      specificData: workspaceComponentIn.specificData,
      name: workspaceComponentIn.name,
      connectionsBefore: workspaceComponentIn.connectionsBefore.map(conn => {
        return {
          _id: conn._id
        }
      }),
      connectionsAfter: workspaceComponentIn.connectionsAfter.map(conn => {
        return {
          _id: conn._id
        }
      }),
      module: workspaceComponentIn.module,
      type: workspaceComponentIn.type,
      description: workspaceComponentIn.description,
      editor: workspaceComponentIn.editor,
      workspaceId: workspaceComponentIn.workspaceId,
      graphPositionX : workspaceComponentIn.graphPositionX,
      graphPositionY : workspaceComponentIn.graphPositionY
    }
    //console.log(out)
    return out;

  } //<= serialiseWorkspaceComponent

  // --------------------------------------------------------------------------------


  this.serialiseWorkspace = function(workspaceIn) {
    console.log('serialiseWorkspace | ', workspaceIn);
    var components = [];
    var out = {
      _id: workspaceIn._id,
      name: workspaceIn.name,
      description: workspaceIn.description,
      limitHistoric : workspaceIn.limitHistoric,
      rowid: workspaceIn.rowid
    }
    for (component of workspaceIn.components) {
      console.log(component)
      components.push(this.serialiseWorkspaceComponent(component));
    }
    out.components = components;
    console.log('serialiseWorkspace | out | ', out);
    return out;

  } //<= serialiseWorkspace
  // --------------------------------------------------------------------------------

}
