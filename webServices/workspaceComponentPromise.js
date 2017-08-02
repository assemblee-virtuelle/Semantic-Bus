module.exports = {
  technicalComponentDirectory: require('./technicalComponentDirectory.js'),
  mLabPromise: require('./mLabPromise'),
  getInsertPromise: function(entityToInsert) {
    var module = this.technicalComponentDirectory[entityToInsert.module];
    console.log(module)
    //console.log(entityToInsert);
    if (entityToInsert.specificData == undefined) {
      entityToInsert.specificData = {};
    }
    if (module.initComponent != undefined) {
      entityToInsert = module.initComponent(entityToInsert);
    }

    //console.log('getInsertPromise | ',entityToInsert);
    entityToInsert.connectionsAfter = entityToInsert.connectionsAfter || [];
    entityToInsert.connectionsBefore = entityToInsert.connectionsBefore || [];


    return this.mLabPromise.request('POST', 'workspaceComponent', entityToInsert);
  },
  getReadPromise: function() {
    //console.log(entityToInsert);
    return this.mLabPromise.request('GET', 'workspaceComponent');
  },
  getReadPromiseById: function(entityIdToRead) {
    //console.log(entityToInsert);
    return this.mLabPromise.request('GET', 'workspaceComponent/'+entityIdToRead);
  }
}

