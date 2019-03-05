module.exports = configuration = () => {
    try {
        console.log("get configuration url ....")
        const configuration = require.resolve("../main/configuration");
        return require(configuration)
    } catch(e) {
        try {
            const configuration = require.resolve("../engine/configuration.js");
            return require(configuration)
        } catch(e) {
            try {
                const configuration = require.resolve("../timer/configuration.js");
                return require(configuration)
            } catch(e) {
                console.log("error get config", e)
            }
        }
    }
}