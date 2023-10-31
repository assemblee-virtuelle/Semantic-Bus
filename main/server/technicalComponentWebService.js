
const componentsCategoriesTree = require('./utils/componentsCategoriesTree')

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = (router, unsafeRouter) => {
  const technicalComponentDirectory = require('./services/technicalComponentDirectory')
  let engineTracer = {pendingProcess:[], redyProcess:[]}
 

  router.get('/technicalComponent', function (req, res) {
    res.json(technicalComponentDirectory.buildDictionnaryArray())
  })

  router.get('/technicalComponent/componentsCategoriesTree', function (req, res, next) {
    res.json(componentsCategoriesTree)
  })
  return technicalComponentDirectory;
}
