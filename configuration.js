module.exports = {
    mlabDBToClone: 'semantic_bus',
    //mlabDB : 'sementic_bus_dev',
    mlabDB: 'sementic_bus_dev',
    saveLock: false,
    addLock: false,
    secret: 'test',
    https: false,
	configMongo: {
		'driver': "mongoose",
		'database': "sementic_bus_dev",
        'url': 'mongodb://alex:alexfoot31@ds052629.mlab.com:52629/sementic_bus_dev',
		'password': 'alexfoot31',
		'username': 'alex'
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE,
        'clientSecret'  : process.env.client_GOOGLE_Secret,
        'callbackURL'   : '/auth/'
    }
}