module.exports = {
	'secret': 'test',
	'configMongo': {
		'driver': "mongoose",
		'database': "semantic_bus_bakc_up",
		'url': 'mongodb://alex:alexfoot31@ds129462.mlab.com:29462/semantic_bus_bakc_up',
		'password': "alexfoot31",
		'username': "alex",
	},
	'googleAuth' : {
        'clientID'      : '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
        'clientSecret'  : 'e-0uRyWiFqkbpCVWQGMh-EpW',
        'callbackURL'   : '/auth/'
    }
}
