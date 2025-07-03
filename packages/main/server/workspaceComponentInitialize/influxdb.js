'use strict';
class InfluxdbConnector {
  constructor() {
    this.type = 'Influxdb';
    this.description = 'Interroger un bucket Influxdb';
    this.editor = 'influxdb-connector-editor';
    this.graphIcon = 'Influx.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/inComponents',
      'http://semantic-bus.org/data/tags/outComponents',
      'http://semantic-bus.org/data/tags/BDDComponents'
    ];
  }
}

module.exports = new InfluxdbConnector();
