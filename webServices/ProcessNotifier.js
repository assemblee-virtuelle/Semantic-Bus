'use strict'

class ProcessNotifier {
  /**
   * @param {amqp.Channel} amqpClient
   * @param {string} workspaceId
   */
  constructor(amqpClient, workspaceId) {
    this.amqpClient = amqpClient
    this.workspaceId = workspaceId
  }

  /**
   * @param {ProcessNotifier.Start} content
   */
  start(content) {
    this.publish(`process-start`, content)
  }

  /**
   * @param {ProcessNotifier.Progress} content
   */
  progress(content) {
    this.publish(`process-progress`, content)
  }

  /**
   * @param {ProcessNotifier.Error} content
   */
  error(content) {
    this.publish(`process-error`, content)
  }

  /**
   * @param {ProcessNotifier.End} content
   */
  end(content) {
    this.publish(`process-end`, content)
  }

  /**
   * @param {ProcessNotifier.Persist} content
   */
  persist(content) {
    this.publish(`process-persist`, content)
  }

  /**
   * @param {ProcessNotifier.ProcessCleaned} content
   */
  processCleaned(content) {
    this.publish(`workflow-processCleaned`, content)
  }

  /**
   * @param {string} key
   * @param {*} content
   * @private
   */
  publish(key, content) {
    this.amqpClient.publish(
      'amq.topic',
      `${key}.${this.workspaceId}`,
      new Buffer(JSON.stringify(content))
    );
  }
}

module.exports = ProcessNotifier