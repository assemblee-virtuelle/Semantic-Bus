var config = require('./configuration');
var mongoose = require('mongoose');  
var bcrypt = require('bcryptjs');
var caminte = require('caminte');
var Schema = caminte.Schema;

///NOUS POUVONS DEFINIR ICI PLUSIEUR MODEL A MAPPER DANS DIFFERENTES BASES DE DONNÉES 
//LA CONFIG DES DIFFERENTES BASES EST A METTRE DANS LE FICHIER DE CONFIGURATION

var schemaMlab = new Schema("mongoose", config.configMongo);

// DEFINITION DES DATA STORE DANS MONGODB

var User = schemaMlab.define('user', {
    email: { type: schemaMlab.String,  limit: 255 },
    password: { type: schemaMlab.Text },
    googleid : {type: schemaMlab.Text, default: null},
    googleToken: {type: schemaMlab.Text, default: null},
    workspaces: {type: schemaMlab.JSON,  default: []},
    admin: { type: schemaMlab.Boolean, default: false},
});

User.validatesPresenceOf('email')
User.validatesUniquenessOf('email', {message: 'email is not unique'});


var getUser = function(){
	return User
}

///TRIGGER POUR ENCRYPTER MDP 

User.beforeCreate = function (next) {
  var user = this;
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
};

// COUCHE DE SECURITE A METTRE EN PLUS POUR COMPARER L INPUT ET LE MOT DE PASSE SAUVE EN BDD

User.prototype.comparePassword = function(pw, cb) {
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = getUser()