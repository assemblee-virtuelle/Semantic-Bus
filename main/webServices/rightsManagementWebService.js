var user_lib = require('../../core').user;
var workspace_lib = require('../../core').workspace;
var technicalComponentDirectory = require('./technicalComponentDirectory.js');



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------



module.exports = function(router) {

  // --------------------------------------------------------------------------------

  function contains(a, obj) {
    if (obj != false) {
      var i = a.length;
      while (i--) {
        //console.log(a[i]);
        //console.log(obj._id);
        if (a[i]._id === obj._id) {
          return true;
        }
      }
      return false;
    }
  } // <= contains


  // --------------------------------------------------------------------------------


  router.put('/share/workspace', function(req, res, next) {
    var data = req.body;
    var workspace_id = req.body.worksapce_id
    var newUser = null
    //console.log("data |", data)
    // FIND BY EMAIL ///
    user_lib.get({
      ['credentials.email']: req.body.email
    }).then(function(user) {
      if (user) {
        //newUser = user
        //userId = user._id
        user.workspaces = user.workspaces || [];
        //console.log("update", user)
        // console.log(newUser)
        // if (newUser.workspaces.length > 0) {
        if (!contains(user.workspaces, {
            _id: workspace_id
          })) {
          user.workspaces.push({
            _id: workspace_id,
            role: "editor"
          })
          user_lib.update(user).then(function(updateUser) {
            workspace_lib.getWorkspace(workspace_id).then(updatedWS => {
              for (var c of updatedWS.components) {

                if (technicalComponentDirectory[c.module] != null) {
                  //console.log('ICON',technicalComponentDirectory[c.module].graphIcon);
                  c.graphIcon = technicalComponentDirectory[c.module].graphIcon;
                } else {
                  c.graphIcon = "default"
                }
                //console.log('-->',c);
              }
              res.send({
                user: updateUser,
                workspace: updatedWS
              });
            })
          })
        } else {
          res.send("already")
        }
        // } else {
        //     newUser.workspaces.push({
        //         _id: workspace_id,
        //         role: "editor"
        //     })
        //    user_lib.update(newUser).then(updateUser=>{
        //         workspace_lib.getWorkspace(workspace_id).then(updatedWS=>{
        //             res.send({user:updateUser,workspace:updatedWS});
        //         })
        //     })
        // }
      } else {
        res.send(false)
      }
    }).catch(e => {
      next(e);
    })
  }) // <= share/workspace


  // --------------------------------------------------------------------------------

  router.get('/workspaces/:idworksapce/user/:iduser', function(req, res, next) {
    var workspace_id = req.params.idworksapce
    var userId = req.params.iduser
    var userTab = [];
    return new Promise(function(resolve, reject) {
      user_lib.get_all({}).then(function(users) {
        // console.log("all user", users)
        if (users) {
          users.forEach(function(user) {
            if (user.workspaces != null) {
              if (user._id != userId) {
                user.workspaces.forEach(function(workspace) {
                  if (workspace._id == workspace_id) {
                    userTab.push({
                      email: user.credentials.email,
                      role: workspace.role
                    })
                  }
                })
              }
            }
          })
          resolve(userTab)
        } else {
          resolve(false)
        }
      })
    }).then(function(user) {
      res.json(user);
    }).catch(e => {
      next(e);
    });
  }) // <= get_workspace

}
