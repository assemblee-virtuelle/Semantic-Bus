
const componentsCategoriesTree = require('./componentsCategoriesTree')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------


module.exports = (router, unsafeRouter, app,stompClient) => {
  const technicalComponentDirectory = require('./technicalComponentDirectory');
  technicalComponentDirectory.initialise(unsafeRouter, app, stompClient);
  
  router.get('/technicalComponent/', function(req, res) {
    res.json(technicalComponentDirectory.buildDictionnaryArray());
  });

  router.get('/technicalComponent/componentsCategoriesTree', function (req, res,next) {
    res.json(componentsCategoriesTree);
  });

}
