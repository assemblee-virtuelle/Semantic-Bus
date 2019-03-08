'use strict'
class GouvFrGeoLocaliser {
  constructor () {
    this.type = 'data.gouv geocoding'
    this.description = 'Interroger l\'API adresse.data.gouv.fr pour trouver une adresse avec la latitude et la longitude.'
    this.editor = 'data-gouv-geolocaliser-editor'
    this.graphIcon = 'Gouv_geocoding.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleGeocodeComponents'
    ]
    this.RequestCount = 0
  }

  initComponent (entity) {
    return entity
  }
}

module.exports = new GouvFrGeoLocaliser()
