
const componentsCategoriesTree = require('./componentsCategoriesTree')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = (router, unsafeRouter, stompClient) => {
  const technicalComponentDirectory = require('./technicalComponentDirectory');
  technicalComponentDirectory.initialise(router,unsafeRouter, stompClient);

  router.get('/technicalComponent', function(req, res) {
    res.json(technicalComponentDirectory.buildDictionnaryArray());
  });

  router.get('/technicalComponent/componentsCategoriesTree', function (req, res,next) {
    res.json(componentsCategoriesTree);
  });

}
