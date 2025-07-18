'use strict';

module.exports = {
  mongoose: require('mongoose'),
  config: require('../config.json'),
  workspaceSchema: require('@semantic-bus/core/model_schemas/workspace_schema'),
  workspaceComponentSchema: require('@semantic-bus/core/model_schemas/workspace_component_schema'),
  userSchema: require('@semantic-bus/core/model_schemas/user_schema'),

  work: function(userId) {
    const conn = this.mongoose.createConnection(this.config.mlabDB, {
      useMongoClient: true
    });
    const conn2 = this.mongoose.createConnection(this.config.mlabDBToClone, {
      useMongoClient: true
    });
    const workspaceModelTarget = conn.model('workspace', this.workspaceSchema);
    const workspaceModelSource = conn2.model('workspace', this.workspaceSchema);
    const workspaceComponentModelTarget = conn.model('workspaceComponent', this.workspaceComponentSchema);
    const workspaceComponentModelSource = conn2.model('workspaceComponent', this.workspaceComponentSchema);
    const userModelTarget = conn.model('user', this.userSchema);
    // console.log('workspaces remove');

    console.log('workspaces import');
    workspaceModelTarget.remove({}).then(message => {
      workspaceModelSource.find({}, {
        'consumption_history': 0
      }).exec((err, WSToImport) => {
        workspaceModelTarget.insertMany(WSToImport, (error, docs) => {
          // console.log(error);
          console.log('workspaces inserted', docs.length);
          userModelTarget.findById(userId).exec((err, user) => {
            user.workspaces = docs.map(r => {
              return {
                _id: r._id,
                role: 'owner'
              };
            });
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
      workspaceComponentModelSource.find({}, {
        'consumption_history': 0
      }).exec((err, WSToImport) => {
        workspaceComponentModelTarget.insertMany(WSToImport, (error, docs) => {
          console.log(error);
          console.log('workspaces component inserted', docs.length);
        });
      });
    });
  }
};
