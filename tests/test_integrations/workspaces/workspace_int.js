var should = require('should');
var workspace = require('../../../lib/core/lib/workspace/workspace_lib');
var workspace_model = require('../../../lib/core/models/workspace_model');
var workspaceComponentModel = require('../../../lib/core/models/workspace_component_model')


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

describe('Workspace test', function () {

    // it('should create one workspace', function (done) {
    //     this.timeout(15000);
    //     workspace.create('5980f22caba439e4521d005e', {}).then(function (workspaces) {
    //         should.exists(workspaces);
    //         done()
    //     })
    // })

    // it('should destroy one workspace', function (done) {
    //     this.timeout(15000);
    //     workspace.destroy('5980f22caba439e4521d005e', '5980fb7bcdf0c3e992a3087c').then(function (workspaces) {
    //         should.exists(workspaces);
    //         done()
    //     })
    // })

    // it('should render all owner workspace', function (done) {
    //     this.timeout(15000);
    //     workspace.getAllOwner('5980f22caba439e4521d005e').then(function (workspaces) {
    //         console.log(workspaces)
    //         should.exists(workspaces);
    //         done()
    //     })
    // })

    //  it('should render all component of one workspace', function (done) {
    //     this.timeout(15000);
    //     workspace.getWorkspaceComponent('5980f23e018143e45e947f56').then(function (workspaces) {
    //         console.log(workspaces)
    //         should.exists(workspaces);
    //         done()
    //     })
    // })

    it('should update one workspace', function (done) {
        this.timeout(15000);
       var  workspaceComponent = new workspaceComponentModel({
               "module": "googleGetJson",
                "type": "GOOGLE calc Get JSON",
                "description": "intéroger une feuille de calcule GOOGLE calc qui fourni un flux JSON",
                "name": "composant 2",
                "editor": "google-get-json-editor",
                "connectionsAfter": [],
                "connectionsBefore": [],
                "workspaceId": '598194a7f36d2839ce8bb510'
       })

       workspaceComponent.save(function (err, work) {
            workspace.update({
                _id: '598194a7f36d2839ce8bb510',
                name: "mon super workspace unique deux",
                description: "great workspace",
                __v: 0,
                average_consumption: 0,
                flow_size: 0,
                components: [work._id]
            }).then(function (workspaces) {
                should.exists(workspaces);
                done()
            })
       })
    })

    // it('should get all components of workspace', function (done) {
    //     this.timeout(15000);
    //     workspace.create('5980f22caba439e4521d005e', {}).then(function (workspaces) {
    //         var workspaceComponent = new workspaceComponentModel({
    //             "module": "googleGetJson",
    //             "type": "GOOGLE calc Get JSON",
    //             "description": "intéroger une feuille de calcule GOOGLE calc qui fourni un flux JSON",
    //             "name": "composant 2",
    //             "editor": "google-get-json-editor",
    //             "connectionsAfter": [],
    //             "connectionsBefore": [],
    //             "workspaceId": workspaces._id
    //         })
  
    //         workspaceComponent.save(function (err, work) {
    //             workspace.update({
    //                 _id: '598194a7f36d2839ce8bb510',
    //                 name: "mon super workspace unique deux",
    //                 description: "great workspace",
    //                 __v: 0,
    //                 average_consumption: 0,
    //                 flow_size: 0,
    //                 components: [work._id]
    //             }).then(function (workspaces) {
    //                 workspace.getWorkspace(workspaces._id).then(function (workspace) {
    //                     should.exists(workspace);
    //                     done() 
    //                 })
    //             })
    //         })
    //     })
    // })
})