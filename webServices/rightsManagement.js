const User = require('./models/userModel');
const config = require('./models/configuration');
const mLabPromise = require('./mLabPromise');
var  contains =  function (a, obj) {
    if(obj != false){
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
}
module.exports = function (router) {

    //On doit pouvoir envoyer un workspace a un utilisateur ==> ajoute run workspace a la liste des worksapces des users
    //rajouter un boolean en base ==> share true : false ou ajouter un array de record avec qui on l'a partagé

    //On doit aussi ajouter une requete pour lister tous les utilisateurs d'un workspaces


    router.put('/share/workspace', function (req, res) {
        var data = req.body;
        var workspace_id = req.body.worksapce_id
        var newUser = null
        console.log("data |", data)
        // FIND BY EMAIL ///
        User.findOne({
            where: {
                email: req.body.email
            }
        }, function (err, user) {
            if (user) {
                newUser = user
                userId = user._id 
                // console.log(newUser)
                if( newUser.workspaces.length > 0){
                    if(!contains(newUser.workspaces, {_id: req.body.worksapce_id})){
                        console.log("send")
                        newUser.workspaces.push({_id:  req.body.worksapce_id, role: "editor"})
                        console.log(newUser)
                        mLabPromise.request('PUT', 'users/' + userId, newUser).then(function(user){
                            res.send(user)
                        })
                    }else{
                        res.send("already")
                    }      
                }else{
                    newUser.workspaces.push({_id:  req.body.worksapce_id, role: "editor"})
                     mLabPromise.request('PUT', 'users/' + userId, newUser).then(function(user){
                            res.send(user)
                     })
                }
                //MLAB CAR CAMINTE A BUGGE SUR L UPDATE ///
            }else{
                res.send(false)
            }
        })
    })



     router.get('/workspaces/:idworksapce/user/:iduser', function (req, res) {
        var workspace_id = req.params.idworksapce
        var userId = req.params.iduser
        var userTab = [];
        return new Promise(function(resolve,reject){
            User.all({
            }, function (err, users) {
                if (users) {
                    users.forEach(function(user){
                        if(user.workspaces != null){
                            //  console.log(user._id)
                            if(user._id != userId){
                                // console.log(user._id.$oid)
                                user.workspaces.forEach(function(workspace){
                                    if(workspace._id == workspace_id){
                                        userTab.push({email: user.email,role: workspace.role})
                                    }
                                })
                            }
                        }
                    })
                    resolve(userTab)
                }else{
                    resolve(false)
                }
            })  
        }).then(function (user) {
            //  console.log(userId)
            // console.log("Vos user ont été envoyé")
            res.json(user);
        });
    })


    
}