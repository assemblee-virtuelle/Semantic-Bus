
const componentsCategoriesTree = require('./utils/componentsCategoriesTree')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = (router, unsafeRouter, stompClient) => {
  const technicalComponentDirectory = require('./services/technicalComponentDirectory')
  technicalComponentDirectory.initialise(router, unsafeRouter, stompClient)

  router.get('/technicalComponent', function (req, res) {
    res.json(technicalComponentDirectory.buildDictionnaryArray())
  })

  router.get('/technicalComponent/componentsCategoriesTree', function (req, res, next) {
    res.json(componentsCategoriesTree)
  })
}
