var user_lib = require('./user_lib')
var secret_stripe = require('../../../configuration').secret_stripe_private
var stripe_redirect_url = require('../../../configuration').stripe_redirect_url
var stripe = require('stripe')(secret_stripe);

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = {
  initStripePayement: _initStripePayement,
  getAllTransactionList: _getAllTransactionList,
  addStripePayement: _addStripePayement
};


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function _getAllTransactionList(userID) {
  return new Promise((resolve, reject) => {
    user_lib.get({
      _id: userID
    })
    .then((user) => {
      if (user.stripeID) {
        user_charges = []
        stripe.charges.list(
          function (err, charges) {
            charges.data.forEach((charge) => {
              if (charge.customer == user.stripeID) {
                if (charge.metadata.date != null) {
                  //console.log(new Date(parseInt(charge.metadata.date)))
                  charge.date = new Date(parseInt(charge.metadata.date))
                  user_charges.push(charge)
                }
              }
            })
            resolve({
              state: "done",
              data: user_charges
            })
          }
        ).catch(err => {
          resolve({
            state: "error"
          })
        });
      } else {
        resolve({
          state: "done",
          data: []
        })
      }
    })
  })
}


function _initStripePayement(userId, user_infos, amount) {
  return new Promise((resolve, reject) => {
    user_lib.get({
      _id: userId
    }).then((user) => {
      if (user.active) {
        let new_amount = parseInt(amount) / 10
        console.log("NEW AMOUNT")
        if (user_infos.card.card.three_d_secure == "required" || user_infos.card.card.three_d_secure == "optional") {
          stripe.sources.create({
            type: 'three_d_secure',
            amount: new_amount,
            currency: "eur",
            three_d_secure: {
              card: user_infos.card.id
            },
            redirect: {
              return_url:  stripe_redirect_url  + "?amount=" + amount + "#profil//payement"
            }
          }).then(function (source) {
            console.log("3D secure", source)
            console.log("USER ACTIVE", user.active)
            if (user.stripeID) {
              console.log("stripe USER EXIST", user.stripeID)
              stripe.customers.retrieve(
                user.stripeID,
                function (err, customer) {
                  console.log("stripe customer", customer)
                  stripe.customers.createSource(
                    customer.id, {
                      source: user_infos.card.id
                    },
                    (err, customer) => {
                      console.log("stripe customer SOURCE", err, customer, source)
                      user.secret_stripe = source.client_secret
                      console.log(" user stripe secret ", user.secret_stripe)
                      user_lib.update(user).then((userUpdate) => {
                        console.log("stripe user update ||", userUpdate)
                        resolve({
                          state: "done",
                          data: source
                        })
                      })
                    }
                  )
                })
            } else {
              console.log("stripe not  EXIST", user.stripeID)
              stripe.customers.create({
                email: user.credentials.email
              }).then(customer => {
                console.log(customer)
                stripe.customers.createSource(
                  customer.id, {
                    source: user_infos.card.id
                  },
                  (err, card) => {
                    if (err) {
                      resolve({
                        state: "error",
                        err: err
                      })
                    }
                    console.log("create stripe user ||", err, customer)
                    user.stripeID = customer.id
                    user_lib.update(user).then((user) => {
                      console.log("stripe user update ||", user)
                      resolve({
                        state: "done",
                        data: source
                      })
                    })
                  })
              })
            }
          })
        } else {
          resolve({
            state: "error",
            err: "user_no_validate"
          })
        }
      } else {
        resolve({
          state: "error",
          err: "user_no_validate"
        })
      }
    })
  })
}

function _addStripePayement(amount, source, secret, userId) {
  return new Promise((resolve, reject) => {
    user_lib.get({
      _id: userId
    }).then((user) => {
      console.log(" resolve stripe user||", user)
      let new_amount = parseInt(amount) / 10
      console.log("NEW AMOUNT", new_amount)
      if (secret == user.secret_stripe) {
        return stripe.charges.create({
          amount: new_amount,
          description: "Sample Charge",
          currency: "eur",
          source: source
        });
      } else {
        resolve({
          state: "error"
        })
      }
    }).then((charge, err)=>{
      console.log("CHARGE", charge)
      if (err) {
        resolve({
          state: "error",
          err: err
        })
      }
      console.log("NEW AMOUT 2", parseInt(amount) + (parseInt(amount) * parseInt(user.discount)))
      user.credit += parseInt(amount) + (parseInt(amount) * user.discount)
      user.secret_stripe = "no";
      return user_lib.update(user);
    }).then((lastUser)=>{
      console.log("user credit update||", lastUser)
      resolve({
        state: "done",
        data: lastUser
      })
    }).catch((err) => {
      resolve({
        state: "error"
      })
      console.log("ERROR ||", err)
    });
  })
}
