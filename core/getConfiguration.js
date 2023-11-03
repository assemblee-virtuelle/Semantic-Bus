module.exports = configuration = () => {
    try {

        var configuration = require('../main/config.json')
        return configuration
    } catch(e) {
        try {
            var configuration = require('../engine/config.json')
            return configuration
        } catch(e) {
            try {
                var configuration = require('../timer/config.json')
                return configuration
            } catch(e) {
                console.log("error get config", e)
            }
        }
    }
}
