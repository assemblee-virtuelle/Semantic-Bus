'use strict'
class GoogleGeoLocaliser {
  constructor () {
    this.type = 'Google geocoding'
    this.description = 'Interroger l\'API Google geocode pour trouver la latitude et la longitude à partir de une adresse.'
    this.editor = 'google-geolocaliser-editor'
    this.graphIcon = 'Google_geocoding.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleGeocodeComponents'
    ]
  }
}

module.exports = new GoogleGeoLocaliser()
