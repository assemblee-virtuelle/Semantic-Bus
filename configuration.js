module.exports = {
    mlabDBToClone: 'semantic_bus',
    //mlabDB : 'sementic_bus_dev',
    mlabDB: 'semantic_bus_seed',
    saveLock: false,
    addLock: false,
    secret: process.env.JWT_TOKEN || 'secret',
    https: false,
    mlab_token: 'ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
	configMongo: {
		'driver': "mongoose",
		'database': "semantic_bus",
		'url': 'mongodb://alex:alexfoot31@ds127153.mlab.com:27153/semantic_bus_seed',
		'password': process.env.MLAB_PASSWORD || 'alexfoot31',
		'username': process.env.MLAB_USERNAME || 'alex'
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE || '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
        'clientSecret'  : process.env.client_GOOGLE_Secret || 'e-0uRyWiFqkbpCVWQGMh-EpW',
        'callbackURL'   : '/auth/'
    }
}