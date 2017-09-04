module.exports = {
  DB: 'sementic_bus_dev',
  DBToClone: 'semantic_bus_prod',
  mlabDBToClone: 'mongodb://alex:alexfoot31@ds131362-a0.mlab.com:31362,ds131362-a1.mlab.com:31362/semantic_bus_prod?replicaSet=rs-ds131362',
  mlabDB: 'mongodb://alex:alexfoot31@ds052629.mlab.com:52629/sementic_bus_dev',
  saveLock: false,
  addLock: false,
  secret: process.env.JWT_TOKEN || 'secret',
  https: false,
  mlab_token: 'ue_eHVRDWSW0r2YZuTLCi1BxVB_zXnOI',
  googleAuth: {
    'clientID': process.env.clientID_GOOGLE || '497545161510-jevr8h52tl51j5gsd208icp5bbbi9suq.apps.googleusercontent.com',
    'clientSecret': process.env.client_GOOGLE_Secret || 'e-0uRyWiFqkbpCVWQGMh-EpW',
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
