module.exports = {
  '@context': {
    'broader': {
      '@id': 'skos:broader',
      '@type': '@id'
    },
    'skos': 'http://www.w3.org/2004/02/skos/core#'
  },
  '@graph': [
    // === MAIN CATEGORIES ===
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integration',
      'skos:prefLabel': 'Intégration'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/triggers',
      'skos:prefLabel': 'Déclencheurs'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulation',
      'skos:prefLabel': 'Manipulation'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/utilities',
      'skos:prefLabel': 'Utilitaires'
    },

    // === INTEGRATION SUBCATEGORIES ===
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integrationApi',
      'broader': ['http://semantic-bus.org/data/tags/integration'],
      'skos:prefLabel': 'API & Web'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integrationFiles',
      'broader': ['http://semantic-bus.org/data/tags/integration'],
      'skos:prefLabel': 'Fichiers'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integrationDatabase',
      'broader': ['http://semantic-bus.org/data/tags/integration'],
      'skos:prefLabel': 'Base de données'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integrationMessaging',
      'broader': ['http://semantic-bus.org/data/tags/integration'],
      'skos:prefLabel': 'Messagerie'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integrationServices',
      'broader': ['http://semantic-bus.org/data/tags/integration'],
      'skos:prefLabel': 'Services'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/integrationGeocoding',
      'broader': ['http://semantic-bus.org/data/tags/integration'],
      'skos:prefLabel': 'Géocodage'
    },

    // === MANIPULATION SUBCATEGORIES ===
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationMapping',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Mapping'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationEvaluation',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Évaluation'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationConversion',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Conversion'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationRestructure',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Restructuration'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationCollections',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Collections'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationAggregation',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Agrégation'
    },
    {
      '@type': 'skos:Concept',
      '@id': 'http://semantic-bus.org/data/tags/manipulationEnrichment',
      'broader': ['http://semantic-bus.org/data/tags/manipulation'],
      'skos:prefLabel': 'Enrichissement'
    }
  ]
};
