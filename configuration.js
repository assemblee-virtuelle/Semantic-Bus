module.exports = {
    mlabDBToClone: 'semantic_bus',
    //mlabDB : 'sementic_bus_dev',
    mlabDB: 'semantic_bus_bakc_up',
    saveLock: false,
    addLock: false,
    secret: 'test',
    https: false,
	configMongo: {
		'driver': "mongoose",
		'database': "semantic_bus_bakc_up",
        'url': 'mongodb://alex:alexfoot31@ds129462.mlab.com:29462/semantic_bus_bakc_up',
		'password': 'alexfoot31',
		'username': 'alex'
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE,
        'clientSecret'  : process.env.client_GOOGLE_Secret,
        'callbackURL'   : '/auth/'
    }
}