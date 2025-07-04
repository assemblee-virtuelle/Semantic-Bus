module.exports = {

  // -------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  /* some other modules you want */

  // --------------------------------------------------------------------------------
  buildDictionnaryArray: function() {
    const directory = [];
    for (const technicalComponent in this) {
      if (technicalComponent != 'initialise' && technicalComponent != 'buildDictionnaryArray') {
        directory.push({
          module: technicalComponent,
          type: this[technicalComponent].type,
          description: this[technicalComponent].description,
          editor: this[technicalComponent].editor,
          graphIcon: this[technicalComponent].graphIcon,
          tags: this[technicalComponent].tags
        });
      }
    }
    return directory;
  },

  initialise: function(router, unSafeRouteur) {

  }
};
