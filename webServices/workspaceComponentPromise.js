 var technicalComponentDirectory = require('./technicalComponentDirectory.js');
 var mLabPromise = require('./mLabPromise');

 // --------------------------------------------------------------------------------
 // --------------------------------------------------------------------------------
 // --------------------------------------------------------------------------------

 module.exports = {

   getInsertPromise: function (entityToInsert) {
     var module = this.technicalComponentDirectory[entityToInsert.module];
     if (entityToInsert.specificData == undefined) {
       entityToInsert.specificData = {};
     }
     if (module.initComponent != undefined) {
       entityToInsert = module.initComponent(entityToInsert);
     }

     //console.log('getInsertPromise | ',entityToInsert);
     entityToInsert.connectionsAfter = entityToInsert.connectionsAfter || [];
     entityToInsert.connectionsBefore = entityToInsert.connectionsBefore || [];


     return this.mLabPromise.request('POST', 'workspacecomponents', entityToInsert);
   }, //<= getInsertPromise

   // --------------------------------------------------------------------------------

   getReadPromise: function () {
     //console.log(entityToInsert);
     return this.mLabPromise.request('GET', 'workspacecomponents');
   }, //<= getReadPromise

   // --------------------------------------------------------------------------------

   getReadPromiseById: function (entityIdToRead) {
     //console.log(entityToInsert);
     return this.mLabPromise.request('GET', 'workspacecomponents/' + entityIdToRead);
   } //<= getReadPromiseById


 }