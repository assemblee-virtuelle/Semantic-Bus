module.exports = {
    mlabDBToClone: 'semantic_bus',
    //mlabDB : 'sementic_bus_dev',
    mlabDB: 'semantic_bus_dev',
    saveLock: false,
    addLock: false,
    secret: process.env.JWT_TOKEN,
    https: "force",
	configMongo: {
		'driver': "mongoose",
		'database': "semantic_bus",
		'url': 'mongodb://alex:alexfoot31@ds054118.mlab.com:54118/semantic_bus',
		'password': process.env.MLAB_PASSWORD,
		'username': process.env.MLAB_USERNAME
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE,
        'clientSecret'  : process.env.client_GOOGLE_Secret,
        'callbackURL'   : '/auth/'
    }
}