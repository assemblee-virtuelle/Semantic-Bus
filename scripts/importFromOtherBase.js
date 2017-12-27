'use strict';

module.exports = {
  mongoose: require('mongoose'),
  config: require('../configuration.js'),
  workspaceSchema: require('../lib/core/model_schemas/workspace_schema'),
  workspaceComponentSchema: require('../lib/core/model_schemas/workspace_component_schema'),
  userSchema: require('../lib/core/model_schemas/user_schema'),

  work: function(userId) {

    let conn = this.mongoose.createConnection(this.config.mlabDB, {
      useMongoClient: true
    });
    let conn2 = this.mongoose.createConnection(this.config.mlabDBToClone, {
      useMongoClient: true
    });
    let workspaceModelTarget = conn.model('workspace', this.workspaceSchema);
    let workspaceModelSource = conn2.model('workspace', this.workspaceSchema);
    let workspaceComponentModelTarget = conn.model('workspaceComponent', this.workspaceComponentSchema);
    let workspaceComponentModelSource = conn2.model('workspaceComponent', this.workspaceComponentSchema);
    let userModelTarget = conn.model('user', this.userSchema);
    //console.log('workspaces remove');



    console.log('workspaces import');
    workspaceModelTarget.remove({}).then(message => {
      workspaceModelSource.find({}).exec((err, WSToImport) => {
        workspaceModelTarget.insertMany(WSToImport, (error, docs) => {
          //console.log(error);
          console.log('workspaces inserted', docs.length);
          userModelTarget.findById(userId).exec((err, user) => {
            user.workspaces = docs.map(r => {
              return {
                _id: r._id,
                role: 'owner'
              }
            })
            user.save((err, WSToImport) => {
              console.log(err);
              if (err == undefined) {
                console.log('all workspaces owed by user');
              }
            });

            // console.log(user);
            // console.log('');
          });
        });
      });
    });


    console.log('workspaces component import');
    workspaceComponentModelTarget.remove({}).then(message => {
      workspaceComponentModelSource.find({}).exec((err, WSToImport) => {
        workspaceComponentModelTarget.insertMany(WSToImport, (error, docs) => {
          console.log(error);
          console.log('workspaces component inserted', docs.length);

        });
      });
    });




  },
}
