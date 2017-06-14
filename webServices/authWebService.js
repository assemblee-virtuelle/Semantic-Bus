const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
var passport = require('passport'); 
const User = require('./models/userModel');
const config = require('./models/configuration');
var jwtService = require('./jwtService');

module.exports = function (authRouter) {
	function generate_token(user) {
		const payload = {
			exp: moment().add(14, 'days').unix(),
			iat: moment().unix(),
			iss: user._id,
		}
		return jwt.sign(payload, config.secret);
	}

	// Inutile pour le moment ici vu que on trigger l'enregistrement en BDD
	// function format(user) {
	// const salt = bcrypt.genSaltSync(10);
	// return {
	// 		mail: user.mail,
	// 		hash: bcrypt.hashSync(user.mail + user.pwd, salt)
	// }
	// };

	authRouter.post('/isTokenValid', function (req, res) {
		console.log("req.body.token");
		console.log(req.body.token);
		if (req.body.token) {
			// console.log(jwtService.require_token(req.body.token))
			jwtService.require_token(req.body.token).then(function (token_result) {
				if (token_result != false) {
					res.send(token_result);
				} else {
					// authRouter.get('localhost://300//auth/login.html');
					res.send(false)
				}
			})
		}
	});


	authRouter.post('/inscription', function (req, res) {
		if (!req.body.emailInscription || !req.body.passwordInscription) {
			res.json({
				success: false,
				message: 'Entrez un bon mot de passe'
			});
		} else {
			User.findOne({
				where: {
					email: req.body.emailInscription
				}
			}, function (err, user) {
				console.log(user);
				if (!user) {
					const newUser = new User({
						email: req.body.emailInscription,
						password: req.body.passwordInscription,
						workspaces: []
					});
					///ERREUR A CATCHER EN CAS DE DOUBLON (DOC A LIRE)
					newUser.save(function () {
						const token = generate_token(newUser);
						res.send({
							user: newUser,
							token: token
						});
					})
				}else{
					res.send(false);
				}
			})
		}
	});


	authRouter.post('/authenticate', function (req, res) {
		console.log(req.body.email)
		User.findOne({
				where: {
					email: req.body.email
				}
			}, function (err, user) {
				console.log(user);
				if (user) {
					user.comparePassword(req.body.password, function (err, isMatch) {
						if (isMatch && !err) {
							//       if (isMatch && !err) {) {
							const token = generate_token(user);
							res.send({
								user: user,
								token: token
							});
						} else {
							res.send("creer toi un compte");
						}
					})
				} else {
					res.send("creer toi un compte");
				}
			})
			.catch(err => {
				return err
			});
	});

	//GOOGLE AUTH

	authRouter.get('/', function(req, res){
		console.log(res)
	})
	
	authRouter.get('/google',
		passport.authenticate('google', { scope : ['profile', 'email'] }));


	authRouter.get('/', 
		passport.authenticate('google', { failureRedirect: '/' , session: false}),
		function(req, res) {
			var result = {user: res.req.user}
			// console.log(result)
			res.send(result)
	});
}



