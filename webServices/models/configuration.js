module.exports = {
	'secret': 'test',
	'configMongo': {
		'driver': "mongoose",
		'database': "sementic_bus_dev",
		// 'url': 'mongodb://alex:123456@ds117311.mlab.com:17311/upload',
		'url': 'mongodb://alex:alexfoot31@ds052629.mlab.com:52629/sementic_bus_dev',
		'password': "alexfoot31",
		'username': "alex",
	},
	'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }
}