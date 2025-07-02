module.exports = configuration = () => {
    try {
        var configuration = require('@semantic-bus/main/config.json')
        return configuration
    } catch(e) {
        try {
            var configuration = require('@semantic-bus/engine/config.json')
            return configuration
        } catch(e) {
            try {
                var configuration = require('@semantic-bus/timer/config.json')
                return configuration
            } catch(e) {
                console.log("❌ Error getting config", e)
            }
        }
    }
}
