module.exports = {
  convertWorkspaceComponentToDictionnary: function(workspaceComponentsList) {
    var workspaceComponentsListDictionnary = {};
    for (var workspaceComponent of workspaceComponentsList) {
      workspaceComponent.connectionsBuilt = false;
      workspaceComponentsListDictionnary[workspaceComponent._id.$oid] = workspaceComponent;
    }
    return workspaceComponentsListDictionnary;
  },
  checkWorkspaceComponentConsistency: function(workspaceComponentsList, callback) {

    //console.log('checkWorkspaceComponentConsistency | in |',workspaceComponentsList);

    var workspaceComponentsListDictionnary = this.convertWorkspaceComponentToDictionnary(workspaceComponentsList);
    //console.log(workspaceComponentsListDictionnary);
    //console.log('components',workspaceComponentsListDictionnary);
    for (workspaceComponentKey in workspaceComponentsListDictionnary) {
      //console.log('component', workspaceComponentKey);
      var workspaceComponent = workspaceComponentsListDictionnary[workspaceComponentKey];
      for (connectionAfter of workspaceComponent.connectionsAfter) {
        //test si le composant suivant à bien dans ces composant precedent le composant en cours de parcours
        if (workspaceComponentsListDictionnary[connectionAfter] && workspaceComponentsListDictionnary[connectionAfter].connectionsBefore.indexOf(workspaceComponentKey) == -1) {
          //console.log('Conn after', workspaceComponentsListDictionnary[connectionAfter]._id.$oid);
          workspaceComponentsListDictionnary[connectionAfter].connectionsBefore.push(workspaceComponentKey);
          workspaceComponentsListDictionnary[connectionAfter].connectionsBuilt = true;
        }
      }
      for (connectionBefore of workspaceComponent.connectionsBefore) {
        //test si le composant precedent à bien dans ces composant suivant le composant en cours de parcours
        if (workspaceComponentsListDictionnary[connectionBefore] && workspaceComponentsListDictionnary[connectionBefore].connectionsAfter.indexOf(workspaceComponentKey) == -1) {
          //console.log('Conn before', workspaceComponentsListDictionnary[connectionBefore]._id.$oid);
          workspaceComponentsListDictionnary[connectionBefore].connectionsAfter.push(workspaceComponentKey);
          workspaceComponentsListDictionnary[connectionBefore].connectionsBuilt = true;
        }
      }
    }


    var out = [];
    for (workspaceComponentKey in workspaceComponentsListDictionnary) {
      if (workspaceComponentsListDictionnary[workspaceComponentKey].connectionsBuilt == true && callback != undefined) {
        callback(workspaceComponentsListDictionnary[workspaceComponentKey]);
      }
      out.push(workspaceComponentsListDictionnary[workspaceComponentKey]);
    }
    console.log("out", out)
    return out;
  }
}
