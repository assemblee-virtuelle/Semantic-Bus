module.exports = {
	'secret': 'test',
	'configMongo': {
		'driver': "mongoose",
		'database': "semantic_bus",
		'url': 'mongodb://alex:alexfoot31@ds054118.mlab.com:54118/semantic_bus',
		'password': "alexfoot31",
		'username': "alex",
	},
	'googleAuth' : {
        'clientID'      : '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
        'clientSecret'  : 'e-0uRyWiFqkbpCVWQGMh-EpW',
        'callbackURL'   : '/auth/'
    }
}
