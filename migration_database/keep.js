'use strict';
var user_model = require('../lib/core/models').user
var workspace_model = require('../lib/core/models').workspace
var workspaceComponent_model = require('../lib/core/models').workspaceComponent
var cache_model = require('../lib/core/models').cache
// var mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


// --------------------------------------------------------------------------------

var conStr = "mongodb://alex:alexfoot31@ds129462.mlab.com:29462/semantic_bus_bakc_up";

var connection = mongodb.connect(conStr);

// --------------------------------------------------------------------------------

function _migration_user() {
  connection.then(function (db) {
    db.collection("users").find().toArray(function (err, users) {
      users.forEach(function (user) {
        var new_version_user = new user_model({
          _id: user._id,
          credentials: {
            email: user.email,
            hashed_password: user.password
          },
          name: user.email.substring(0, user.email.indexOf("@")),
          society: user.society,
          job: user.job,
          googleId: user.googleid,
          googleToken: user.googleToken,
          workspaces: user.workspaces,
          admin: user.admin,
          dates: {
            created_at: new Date(),
            updated_at: new Date()
          }
        })
        new_version_user.save(function (err, userData) {
          if (err) {
            throw TypeError(err);
          } else {
            console.log("save")
          }
        })
      })
    });
  })
} //<= _migration_user


// --------------------------------------------------------------------------------

function _migration_workspace() {
  db.collection("workspace").find().toArray(function (err, workspaces) {
    workspaces.forEach(function (workspace, index) {
      var new_version_workspace = new workspace_model({
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        components: workspaces.components
      })
    })
  })
}//<= _migration_workspace


// --------------------------------------------------------------------------------

function _migration_workspace_component() {
  db.collection("workspaceComponent").find().toArray(function (err, workspaceComponents) {
    workspaceComponents.forEach(function (workspaceComponent, index) {
      var new_version_workspaceComponent = new workspaceComponent_model({
        _id: workspaceComponent._id,
        module: workspaceComponent.module,
        name: workspaceComponent.name,
        type: workspaceComponent.type,
        description: workspaceComponent.description,
        editor: workspaceComponent.editor,
        connectionsAfter: workspaceComponent.connectionsAfter,
        connectionsBefore: workspaceComponent.connectionsBefore,
        workspaceId: workspaceComponent.workspaceId,
        specificData: workspaceComponent.specificData
      })
    })
  })
}//<= _migration_workspace_component


// --------------------------------------------------------------------------------

function _migration_cache() {
  db.collection("cache").find().toArray(function (err, caches) {
    caches.forEach(function (cache, index) {
      var new_version_cache_model = new cache_model({
        _id: cache._id,
        data: cache.data
      })
    })
  })
}//<= _migration_workspace_component

// --------------------------------------------------------------------------------

_migration_user();
_migration_workspace();
_migration_cache();
_migration_workspace_component()
