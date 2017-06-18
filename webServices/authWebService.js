const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
var passport = require('passport');
const User = require('./models/userModel');
const config = require('./models/configuration');
var jwtService = require('./jwtService');
var path = require('path');

module.exports = function (authRouter) {
	function generate_token(user) {
		const payload = {
			exp: moment().add(14, 'days').unix(),
			iat: moment().unix(),
			iss: user._id,
			subject: user.googleid,
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
			res.send(false);
		} else {
			User.findOne({
				where: {
					email: req.body.emailInscription
				}
			}, function (err, user) {
				console.log("firt user |", user);
				if (user == null) {
					console.log(" in firt user");
					console.log("req.body.emailInscription |", req.body.emailInscription)
					console.log("req.body.passwordInscription |", req.body.passwordInscription.split("").length )
					var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
					console.log("regex |", req.body.emailInscription.match(reg));
					if ((req.body.emailInscription.match(reg) != null) && (req.body.passwordInscription.split("").length > 5)) {
						const newUser = new User();
						newUser.email = req.body.emailInscription,
						console.log("req.body.emailInscription |", req.body.emailInscription)
						newUser.password = req.body.passwordInscription,
						console.log("req.body.passwordInscription |", req.body.passwordInscription)
						newUser.workspaces = []
						console.log("new User |", newUser)
						///ERREUR A CATCHER EN CAS DE DOUBLON (DOC A LIRE)
						newUser.save(function() {
							const token = generate_token(newUser);
							res.send({
								user: newUser,
								token: token
							});
						})
					} else {
						res.send(false);
					}
				} else {
					res.send(false);
				}
			})
		}
	});


	authRouter.post('/authenticate', function (req, res) {
		console.log(req.body.token)
		if (req.body.token != null) {
			User.findOne({
				where: {
					googleToken: req.body.token
				}
			}, function (err, user) {
				if (user) {
					user.googleToken = null;
					console.log(user);
					user.save(function (err, result) {
						if (err) {
							throw err;
						}
						const token = generate_token(user);
						res.send({
							user: user,
							token: token
						});
					});
				} else {
					res.send("creer toi un compte");
				}
			})
		} else {
			console.log(req.body.googleid)
			User.findOne({
					where: {
						email: req.body.email
					}
				}, function (err, user) {
					if (user) {
						if (req.body.googleid == null) {
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
							res.send(false);
						}
					} else {
						res.send("creer toi un compte");
					}
				})
				.catch(err => {
					return err
				});
		}
	});

	//GOOGLE AUTH

	// authRouter.get('/login', function(req, res){
	// 	res.sendFile(path.join(__dirname, '../static', 'login.html'));
	// })

	authRouter.get('/google',
		passport.authenticate('google', {
			scope: ['email']
		}));



	authRouter.get('/',
		passport.authenticate('google', {
			failureRedirect: '/login.html',
			session: false
		}),
		function (req, res) {
			const token = generate_token(res.req.user);
			var result = {
				token: token,
				user: res.req.user
			};
			console.log(res.req.user)
			res.redirect('./login.html?google_token=' + res.req.user.googleToken);
			// res.sendFile(result)
		});

}