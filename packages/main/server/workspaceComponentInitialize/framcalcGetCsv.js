'use strict';

class FramcalcGetCsv {
  constructor() {
    this.type = 'Framcalc';
    this.description = 'Récupérer des données depuis Framcalc.';
    this.editor = 'framcalc-get-csv-editor'; // TODO: corriger le typo (framacalc) et renommer le tag client + migrer les composants en base
    this.graphIcon = 'Framacalc.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationServices'
    ];
  }
}

module.exports = new FramcalcGetCsv();
