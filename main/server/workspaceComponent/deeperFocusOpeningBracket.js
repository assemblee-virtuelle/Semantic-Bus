'use strict';
class DeeperFocusOpeningBracket {
  constructor () {
    this.type = 'Deeper Focus'
    this.description = 'Début de traitement d\'un niveau de profondeur du flux.'
    this.editor = 'deeper-focus-opening-bracket-editor'
    this.graphIcon = 'Deeper_focus.svg'
    this.tags = [
      'http://semantic-bus.org/data/tags/middleComponents',
      'http://semantic-bus.org/data/tags/middleUtilitiesComponents'
    ]
  }

  pull (data, flowData) {
    return new Promise((resolve, reject) => {
      const dfob = flowData[0].dfob == undefined ? [] : flowData.dfob
      let dfobPath = data.specificData.dfobPath == undefined ? '' : data.specificData.dfobPath
      dfob.push({ path: dfobPath, keepArray: data.specificData.keepArray })
      resolve({ data: flowData[0].data, dfob: dfob })
    })
  }
}
module.exports = new DeeperFocusOpeningBracket()
