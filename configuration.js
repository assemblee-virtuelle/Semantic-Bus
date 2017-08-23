module.exports = {
    mlabDBToClone: 'mongodb://alex:alexfoot31@ds052629.mlab.com:52629/sementic_bus_dev',
    mlabDB: 'mongodb://alex:alexfoot31@ds052629.mlab.com:52629/sementic_bus_dev',
    mlab_migration: 'mongodb://alex:alexfoot31@ds129462.mlab.com:29462/sementic_bus_dev',
    saveLock: false,
    addLock: false,
    secret: process.env.JWT_TOKEN || 'secret',
    https: false,
    mlab_token: 'ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
	configMongo: {
		'driver': "mongoose",
        'database': "semantic_bus",
		'url': 'mongodb://alex:alexfoot31@ds052629.mlab.com:52629/sementic_bus_dev',
		'password': process.env.MLAB_PASSWORD || 'alexfoot31',
		'username': process.env.MLAB_USERNAME || 'alex'
	},
	googleAuth : {
        'clientID'      : process.env.clientID_GOOGLE || '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
        'clientSecret'  : process.env.client_GOOGLE_Secret || 'e-0uRyWiFqkbpCVWQGMh-EpW',
        'callbackURL'   : '/auth/'
    }
}


