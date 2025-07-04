'use strict';
module.exports = {
  type: 'adresse.data.gouv.fr geolocaliser par lot',
  description: 'MAINTENANCE',
  editor: 'data-gouv-geolocaliser-mass-editor',
  graphIcon: 'Gouv_geocoding.svg',
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleGeocodeComponents'
  ],
  initComponent: function(entity) {
    return entity;
  }
};
