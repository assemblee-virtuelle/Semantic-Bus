module.exports = {
    mlabDBToClone: 'semantic_bus',
    //mlabDB : 'sementic_bus_dev',
    mlabDB: 'semantic_bus_seed',
    mlab_token: process.env.MLAB_TOKEN || 'ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
    saveLock: false,
    addLock: false,
    secret: process.env.JWT_TOKEN || 'test',
    https: false,
	configMongo: {
		'driver': "mongoose",
		'database': "semantic_bus",
		'url': 'mongodb://alex:alexfoot31@ds054118.mlab.com:54118/semantic_bus',
		'password': process.env.MLAB_PASSWORD,
		'username': process.env.MLAB_USERNAME
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE || '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
        'clientSecret'  : process.env.client_GOOGLE_Secret || 'e-0uRyWiFqkbpCVWQGMh-EpW',
        'callbackURL'   : '/auth/'
    }
}