module.exports = {
	'secret': 'test',
	'configMongo': {
		'driver': "mongoose",
		'database': "sementic_bus_dev",
		'url': 'mongodb://alex:alexfoot31@ds054118.mlab.com:54118/sementic_bus_dev',
		'password': "alexfoot31",
		'username': "alex",
	},
	'googleAuth' : {
        'clientID'      : '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
        'clientSecret'  : 'e-0uRyWiFqkbpCVWQGMh-EpW',
        'callbackURL'   : '/auth/'
    }
}
