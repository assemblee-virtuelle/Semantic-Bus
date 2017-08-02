module.exports = {
    mlabDBToClone: 'semantic_bus',
    //mlabDB : 'sementic_bus_dev',
    mlabDB: 'sementic_bus_dev',
    saveLock: false,
    addLock: false,
    secret: process.env.JWT_TOKEN,
    https: "force",
	configMongo: {
		'driver': "mongoose",
		'database': "sementic_bus_dev",
		'url': 'mongodb://alex:alexfoot31@ds054118.mlab.com:54118/sementic_bus_dev',
		'password': process.env.MLAB_PASSWORD,
		'username': process.env.MLAB_USERNAME
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE,
        'clientSecret'  : process.env.client_GOOGLE_Secret,
        'callbackURL'   : '/auth/'
    }
}