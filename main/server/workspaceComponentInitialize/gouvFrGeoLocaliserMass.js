'use strict'
module.exports = {
  type: 'adresse.data.gouv.fr geolocaliser par lot',
  description: 'interroger l\'api adresse.data.gouv pour transo une adresse en latitude et longitude par lot pour les gros volumes',
  editor: 'data-gouv-geolocaliser-mass-editor',
  graphIcon: 'Gouv_geocoding.svg',
  tags: [
    'http://semantic-bus.org/data/tags/middleComponents',
    'http://semantic-bus.org/data/tags/middleGeocodeComponents'
  ],
  initComponent: function (entity) {
    return entity
  }
}
