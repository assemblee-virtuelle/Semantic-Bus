module.exports = {
  DB: 'semantic_bus_prod',
  DBToClone: 'semantic_bus_prod',
  mlabDBToClone: 'mongodb://'+ process.env.MLAB_USERNAME + ':' + process.env.MLAB_PASSWORD + '@ds131362-a0.mlab.com:31362,ds131362-a1.mlab.com:31362/semantic_bus_prod?replicaSet=rs-ds131362',
  mlabDB: process.env.Mongo_Base,
  addLock: false,
  secret: process.env.JWT_TOKEN,
  https: "force",
  mlab_token: process.env.MLAB_TOKEN,
  googleAuth: {
    'clientID': process.env.clientID_GOOGLE,
    'clientSecret': process.env.client_GOOGLE_Secret,
    'callbackURL': '/auth/'
  },
  DBVersion : 2,
  DBscripts: [{
    sourceVersion: 1,
    destinationVersion: 2,
    script: require('./migration_database/v1_v2'),
    desc: 'V1 -> V2 (add mongoose model)'
  }]
}
