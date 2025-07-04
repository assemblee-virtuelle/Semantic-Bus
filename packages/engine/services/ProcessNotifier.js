'use strict';

class ProcessNotifier {
  /**
   * @param {amqp.Channel} amqpChannel
   * @param {string} workspaceId
   */
  constructor(amqpChannel, workspaceId) {
    this.amqpChannel = amqpChannel;
    this.workspaceId = workspaceId;
  }

  /**
   * @param {ProcessNotifier.Start} content
   */
  start(content) {
    this.publish('process-start', content);
  }

  /**
   * @param {ProcessNotifier.Progress} content
   */
  progress(content) {
    this.publish('process-progress', content);
  }

  /**
   * @param {ProcessNotifier.Error} content
   */
  error(content) {
    this.publish('process-error', content);
  }

  /**
   * @param {ProcessNotifier.Information} content
   */

  information(content) {
    this.publish('process-information', content);
  }

  /**
   * @param {ProcessNotifier.End} content
   */
  end(content) {
    this.publish('process-end', content);
  }

  /**
   * @param {ProcessNotifier.Persist} content
   */
  persist(content) {
    this.publish('process-persist', content);
  }

  /**
   * @param {ProcessNotifier.ProcessCleaned} content
   */
  processCleaned(content) {
    this.publish('workflow-processCleaned', content);
  }

  /**
   * @param {string} key
   * @param {*} content
   * @private
   */
  publish(key, content) {
    // console.log('publish',key);
    this.amqpChannel.publish(
      'amq.topic',
      `${key}.${this.workspaceId}`,
      // new Buffer(JSON.stringify(content))
      // JSON.stringify(content)
      content
    ).then(() => {
      // return console.log('Message was sent!  Hooray!');
      // console.log('amqp sent');
    })
      .catch((err) => {
        // return console.log('Message was rejected...  Boo!');
        console.error('amq fail',err);
      });
  }
}

module.exports = ProcessNotifier;
