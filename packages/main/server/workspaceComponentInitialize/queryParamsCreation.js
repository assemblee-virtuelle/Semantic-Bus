'use strict';
class QueryParamsCreation {
  constructor() {
    this.type = 'Params transform';
    this.description = 'Créer des paramètres de requête dans le flux.';
    this.editor = 'query-params-creation-editor';
    this.graphIcon = 'Query_params.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/manipulation',
      'http://semantic-bus.org/data/tags/manipulationMapping'
    ];
  }
}

module.exports = new QueryParamsCreation();
