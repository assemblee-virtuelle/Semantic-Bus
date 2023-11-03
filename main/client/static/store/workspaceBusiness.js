function WorkspaceBusiness () {
  // --------------------------------------------------------------------------------

  this.connectWorkspaceComponent = function (workspaceComponentsList) {
    workspaceComponentsList.forEach(component => {
      if (component != null) {
        component.connectionsAfter = component.connectionsAfter.map(componentId => {
          let mergedId = componentId._id ? componentId._id : componentId
          return (sift({
            _id: mergedId
          }, workspaceComponentsList))[0]
        })
        component.connectionsAfter = sift({ $ne: undefined }, component.connectionsAfter)

        component.connectionsBefore = component.connectionsBefore.map(componentId => {
          let mergedId = componentId._id ? componentId._id : componentId
          return (sift({
            _id: mergedId
          }, workspaceComponentsList))[0]
        })
        component.connectionsBefore = sift({ $ne: undefined }, component.connectionsBefore)
      }
    })
  } // <= connectWorkspaceComponent

  this.unserializeWorkspace = function (workspace) {
    this.connectWorkspaceComponent(workspace.components)
  } // <= connectWorkspaceComponent

  // --------------------------------------------------------------------------------

  this.serialiseWorkspaceComponent = function (workspaceComponentIn) {
    // console.log("SERIALISE",workspaceComponentIn);
    var out = {
      _id: workspaceComponentIn._id,
      specificData: workspaceComponentIn.specificData,
      deeperFocusData: workspaceComponentIn.deeperFocusData,
      name: workspaceComponentIn.name,
      module: workspaceComponentIn.module,
      type: workspaceComponentIn.type,
      description: workspaceComponentIn.description,
      editor: workspaceComponentIn.editor,
      workspaceId: workspaceComponentIn.workspaceId,
      persistProcess: workspaceComponentIn.persistProcess,
      graphPositionX: workspaceComponentIn.graphPositionX,
      graphPositionY: workspaceComponentIn.graphPositionY
    }
    // console.log(out)
    return out
  } // <= serialiseWorkspaceComponent

  // --------------------------------------------------------------------------------

  this.serialiseWorkspace = (workspaceIn) => {
    var components = []
    var out = {
      _id: workspaceIn._id,
      name: workspaceIn.name,
      description: workspaceIn.description,
      limitHistoric: workspaceIn.limitHistoric,
      engineVersion : workspaceIn.engineVersion,
      rowid: workspaceIn.rowid
    }
    for (let component of workspaceIn.components) {
      components.push(this.serialiseWorkspaceComponent(component))
    }
    out.components = components
    return out
  } // <= serialiseWorkspace
}
