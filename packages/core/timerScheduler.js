'use strict';
const Error = require('./helpers/error.js');

module.exports = {
  componentLib: require('./lib/workspace_component_lib.js'),
  workspaceLib: require('./lib/workspace_lib.js'),
  jwt: require('jwt-simple'),
  moment: require('moment'),
  http: require('http'),
  url: require('url'),
  config: require('@semantic-bus/timer/config.json'),
  intervalId: null,
  runTimers: function (amqpConnection) {
    // console.log('----- Timer Cron')
    this.componentLib.get_all_withConsomation({
      module: 'timer'
    }).then(components => {
      components.forEach(c => {
        // console.log(`inspect ${c.workspaceId}-${c._id}`);
        this.workspaceLib.getWorkspace(c.workspaceId).then(workspace => {
          // console.log(`check ${workspace._id}-${c._id} status:${workspace.status} name:${workspace.name}`);
          if (workspace.status != 'running') {
            const now = new Date();
            const nextExec = c.specificData.next == undefined ? undefined : new Date(c.specificData.next);
            // console.log('nextExec',nextExec);
            // console.log(c.specificData.interval)
            if (c.specificData.interval != undefined) {
              const interval = c.specificData.interval;

              if (nextExec == undefined || nextExec < now) {
                // console.log('Timer dedidated!', c._id,c.workspaceId);
                console.log(`--------------- execution ${workspace._id}-${c._id} status:${workspace.status} name:${workspace.name}`);


                const workParams = {
                  id: c._id
                };

                amqpConnection.sendToQueue(
                  'work-ask',
                  Buffer.from(JSON.stringify(workParams)),
                  null,

                  (err, ok) => {
                    if (err !== null) {
                      console.error('Erreur lors de l\'envoi du message :', err);
                    } else {
                      console.log('Message envoyé à la file ');
                      // res.send(workParams);
                    }
                  }
                );
              }
            }
          }
        })
          .catch(e => {
            // Check if workspace was not found (orphan timer component)
            if (e instanceof Error.EntityNotFoundError) {
              console.warn(`Workspace ${c.workspaceId} not found for timer ${c._id}, removing orphan component`);
              this.componentLib.remove({ _id: c._id })
                .then(() => {
                  console.log(`Orphan timer component ${c._id} successfully removed`);
                })
                .catch(removeErr => {
                  console.error(`Failed to remove orphan timer component ${c._id}:`, removeErr);
                });
            } else {
              console.error(c, e);
            }
          });
      });
    });
  },
  run: function (amqpConnection) {
    // this.address = address;
    this.runTimers(amqpConnection);
    this.intervalId = setInterval(this.runTimers.bind(this, amqpConnection), 60000);
  },
  stop: function () {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Timer scheduler stopped');
    }
  }
};
