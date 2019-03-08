module.exports = {
  '@context': {
    'broader': {
      '@id': 'skos:broader',
      '@type': '@id'
    },
    'skos': 'http://www.w3.org/2004/02/skos/core#'
  },
  '@graph': [
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/inComponents',
      'skos:prefLabel': 'Entrées'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/middleComponents',
      'skos:prefLabel': 'Flux'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/persistComponents',
      'skos:prefLabel': 'Stockage'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/outComponents',
      'skos:prefLabel': 'Sorties'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/BDDComponents',
      'broader': ['http://semantic-bus.org/data/tags/inComponents', 'http://semantic-bus.org/data/tags/outComponents'],
      'skos:prefLabel': 'Base de données'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/APIComponents',
      'broader': ['http://semantic-bus.org/data/tags/inComponents', 'http://semantic-bus.org/data/tags/outComponents'],
      'skos:prefLabel': 'Flux de données'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/fileComponents',
      'broader': ['http://semantic-bus.org/data/tags/inComponents', 'http://semantic-bus.org/data/tags/outComponents'],
      'skos:prefLabel': 'Fichier'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/scrapperComponents',
      'broader': ['http://semantic-bus.org/data/tags/inComponents'],
      'skos:prefLabel': 'Scrapper'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/middleComponentsAgregation',
      'broader': ['http://semantic-bus.org/data/tags/middleComponents'],
      'skos:prefLabel': 'Agrégation'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/middleQueryingComponents',
      'broader': ['http://semantic-bus.org/data/tags/middleComponents'],
      'skos:prefLabel': 'Transformation'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/persistCacheComponents',
      'broader': ['http://semantic-bus.org/data/tags/persistComponents'],
      'skos:prefLabel': 'Cache'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/middleUtilitiesComponents',
      'broader': ['http://semantic-bus.org/data/tags/middleComponents'],
      'skos:prefLabel': 'Utilitaire'
    }, {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/middleGeocodeComponents',
      'broader': ['http://semantic-bus.org/data/tags/middleComponents'],
      'skos:prefLabel': 'Geocodage'
    }

  ]
}
