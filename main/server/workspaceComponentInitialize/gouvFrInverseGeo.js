'use strict'
class GouvFrInverseGeo {
  constructor () {
    this.type = 'data.gouv reverse geocoding'
    this.description = 'Interroger l\'API adresse.data.gouv.fr pour trouver une adresse à partir de la latitude et la longitude.'
    this.editor = 'data-gouv-inverse-geolocaliser-editor'
    this.graphIcon = 'Gouv_geocoding.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleGeocodeComponents'
    ]
  }

  initComponent (entity) {
    return entity
  }
}

module.exports = new GouvFrInverseGeo()
