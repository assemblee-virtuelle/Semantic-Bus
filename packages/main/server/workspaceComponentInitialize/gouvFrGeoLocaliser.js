'use strict';
class GouvFrGeoLocaliser {
  constructor() {
    this.type = 'data.gouv geocoding';
    this.description = 'Interroger l\'API adresse.data.gouv.fr pour trouver la latitude et la longitude à partir de une adresse.';
    this.editor = 'data-gouv-geolocaliser-editor';
    this.graphIcon = 'Gouv_geocoding.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationGeocoding',
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationEnrichment'
    ];
    this.RequestCount = 0;
  }

  initComponent(entity) {
    return entity;
  }
}

module.exports = new GouvFrGeoLocaliser();
