'use strict';

var mongoose = require('mongoose');

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

var WorkspaceComponentSchema = mongoose.Schema({
    module: String,
    type: String,
    name:String,
    description: String,
    editor: String,
    graphIcon: String,
    graphPositionX:Number,
    graphPositionY:Number,
    workspaceId: String,
    persistProcess :{
        type: Boolean,
        default: false
    },
    specificData: {
        type: Object,
        default: {}
    }
}, { minimize: false })



// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

module.exports = WorkspaceComponentSchema;
