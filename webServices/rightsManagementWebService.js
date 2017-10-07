
const mLabPromise = require('./mLabPromise');
var user_lib = require('../lib/core').user
var workspace_lib = require('../lib/core').workspace



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------



module.exports = function (router) {

    // --------------------------------------------------------------------------------

    function contains(a, obj) {
        if (obj != false) {
            var i = a.length;
            while (i--) {
                console.log(a[i]);
                console.log(obj._id);
                if (a[i]._id === obj._id) {
                    return true;
                }
            }
            return false;
        }
    } // <= contains


    // --------------------------------------------------------------------------------


    router.put('/share/workspace', function (req, res) {
        var data = req.body;
        var workspace_id = req.body.worksapce_id
        var newUser = null
        console.log("data |", data)
        // FIND BY EMAIL ///
        user_lib.get({
                    ['credentials.email']: req.body.email
        }).then(function (user) {
            if (user) {
                newUser = user
                userId = user._id
                console.log("update", user)
                // console.log(newUser)
                if (newUser.workspaces.length > 0) {
                    if (!contains(newUser.workspaces, {
                            _id: workspace_id
                        })) {
                        newUser.workspaces.push({
                            _id: workspace_id,
                            role: "editor"
                        })
                        user_lib.update(newUser).then(function (user) {
                            res.send(user)
                        })
                    } else {
                        res.send("already")
                    }
                } else {
                    newUser.workspaces.push({
                        _id: workspace_id,
                        role: "editor"
                    })
                   user_lib.update(newUser).then(updatedUser=>{
                        workspace_lib.getWorkspace(workspace_id).then(updatedWS=>{
                            res.send({user:updatedUser,workspace:updatedWS});
                        })
                    })
                }
            } else {
                res.send(false)
            }
        })
    }) // <= share/workspace


    // --------------------------------------------------------------------------------

    router.get('/workspaces/:idworksapce/user/:iduser', function (req, res) {
        var workspace_id = req.params.idworksapce
        var userId = req.params.iduser
        var userTab = [];
        return new Promise(function (resolve, reject) {
            user_lib.get_all({}).then(function (users) {
                // console.log("all user", users)
                if (users) {
                    users.forEach(function (user) {
                        if (user.workspaces != null) {
                            if (user._id != userId) {
                                user.workspaces.forEach(function (workspace) {
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
        }).then(function (user) {
            res.json(user);
        });
    }) // <= get_workspace

}
