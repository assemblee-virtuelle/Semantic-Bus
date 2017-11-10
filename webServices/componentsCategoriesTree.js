module.exports = {
  "@context": {
    "broader": {
      "@id": "skos:broader",
      "@type": "@id"
    },
    "skos": "http://www.w3.org/2004/02/skos/core#"
  },
  "@graph": [
    {
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/inComponents",
      "skos:prefLabel": "Entrées"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/inComponentsBDD",
      "broader": "http://semantic-bus.org/data/tags/inComponents",
      "skos:prefLabel": "Base de données"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/inComponentsAPI",
      "broader": "http://semantic-bus.org/data/tags/inComponents",
      "skos:prefLabel": "Flux de données"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/inComponentsFile",
      "broader": "http://semantic-bus.org/data/tags/inComponents",
      "skos:prefLabel": "Fichier"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/middleComponents",
      "skos:prefLabel": "Traitements"
    }, {
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/middleComponentsAgregation",
      "broader": "http://semantic-bus.org/data/tags/middleComponents",
      "skos:prefLabel": "Agrégation"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/middleQuerying",
      "broader": "http://semantic-bus.org/data/tags/middleComponents",
      "skos:prefLabel": "Transformation"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/outComponents",
      "skos:prefLabel": "Sorties"
    }, {
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/outComponentsBDD",
      "broader": "http://semantic-bus.org/data/tags/outComponents",
      "skos:prefLabel": "Base de données"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/outComponentsAPI",
      "broader": "http://semantic-bus.org/data/tags/outComponents",
      "skos:prefLabel": "Flux de données"
    },{
      "@type": "skos:Concept",
      "@id": "http://semantic-bus.org/data/tags/outComponentsFile",
      "broader": "http://semantic-bus.org/data/tags/outComponents",
      "skos:prefLabel": "Fichier"
    }
  ]
}
