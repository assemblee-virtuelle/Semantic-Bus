module.exports = {
  type: 'Object Transformer',
  description: 'transformer un objet par mapping grâce à un objet transformation',
  editor: 'object-transformer',
  transform: require('jsonpath-object-transform'),
  initComponent: function(entity) {
    //console.log('Object Transformer | initComponent : ',entity);

    if (entity.specificData.transformObject == undefined) {
      entity.specificData.transformObject = {};
    }
    return entity;
  },
  jsonTransform: function(source, jsonTransformPattern) {
    //console.log('Object Transformer | source',source,' | pattern | ',jsonTransformPattern);
    //console.log(source);
    //console.log(jsonTransformPattern);
    //console.log(jsonSchema);
    var array = true;
    for (var propertyKey in source) {
      //console.log(parseInt(propertyKey));
      if (isNaN(propertyKey)) {
        array = false;
        //console.log('BREAK ARRAY');
      }
    }

    if (array == true) {

      var destArray = [];
      for (var propertyKey in source) {
        var record = source[propertyKey];
        destArray.push(record);
      }
      source = destArray;
    }

    array = true;
    for (var propertyKey in jsonTransformPattern) {
      if (isNaN(propertyKey)) {
        array = false;
      }
    }
    if (array == true) {
      var destArray = [];
      for (var propertyKey in jsonTransformPattern) {
        var record = jsonTransformPattern[propertyKey];
        destArray.push(record);
      }
      jsonTransformPattern = destArray;
    }



    var dissociatePatternResolvable = this.dissociatePatternResolvable(jsonTransformPattern);
    var dissociatePatternPostProcess = this.dissociatePatternPostProcess(jsonTransformPattern);
    console.log('resolvable | ', dissociatePatternResolvable);
    console.log('postProcess | ', dissociatePatternPostProcess);
    var transformResult = this.transform(source, dissociatePatternResolvable);
    if (Object.keys(transformResult)[0] == 'undefined') {
      transformResult = transformResult['undefined'];
    }
    //console.log('jsonTransform | resultBeforUnresolved |',transformResult);
    var destResult = this.unresolveProcess(transformResult, dissociatePatternResolvable)
    console.log('jsonTransform | afterBeforUnresolved |',destResult);
    var postProcessResult;
    if (dissociatePatternPostProcess == undefined) {
      postProcessResult = destResult;
    } else {
      postProcessResult = this.postProcess(destResult, dissociatePatternPostProcess)
    }

    console.log(postProcessResult);
    return postProcessResult;
  },
  dissociatePatternResolvable: function(nodeIn) {
    var nodeOut = {}
    if (Array.isArray(nodeIn)) {
      nodeOut = [];
    } else {
      nodeOut = {};
    }


    for (var key in nodeIn) {
      //console.log('node |', typeof nodeIn[key], ' | ', nodeIn[key]);
      if (typeof nodeIn[key] == 'object') {

        if (Array.isArray(nodeIn)) {
          nodeOut.push(this.dissociatePatternResolvable(nodeIn[key]));
        } else {
          nodeOut[key] = this.dissociatePatternResolvable(nodeIn[key]);
        }

      } else {
        if (typeof nodeIn[key] == 'string') {
          if (nodeIn[key].indexOf(':') != -1) {
            var resolvablePattern = nodeIn[key].substring(0, nodeIn[key].indexOf(':'));
            nodeOut[key] = resolvablePattern;
          } else {
            nodeOut[key] = nodeIn[key];
          }
        } else {
          nodeOut[key] = nodeIn[key];
        }
      }
    }
    //console.log(nodeOut);
    return nodeOut;
  },
  dissociatePatternPostProcess: function(nodeIn) {
    var nodeOut = {}
    if (Array.isArray(nodeIn)) {
      nodeOut = [];
    } else {
      nodeOut = {};
    }

    for (var key in nodeIn) {
      //console.log('node |', typeof nodeIn[key], ' | ', nodeIn[key]);
      if (typeof nodeIn[key] == 'object') {
        var dissociatePatternPostProcess = this.dissociatePatternPostProcess(nodeIn[key]);
        if (dissociatePatternPostProcess != undefined) {
          if (Array.isArray(nodeIn)) {
            nodeOut.push(this.dissociatePatternPostProcess(nodeIn[key]));
          } else {
            nodeOut[key] = this.dissociatePatternPostProcess(nodeIn[key]);
          }
        }
      } else {
        if (typeof nodeIn[key] == 'string') {
          if (nodeIn[key].indexOf(':') != -1) {
            var postProcessPattern = nodeIn[key].substring(nodeIn[key].indexOf(':') + 1, nodeIn[key].length);
            nodeOut[key] = {
              process: 'typeConvertion',
              type: postProcessPattern
            };
          } else if (key == 0 && nodeIn[key].indexOf('$') != -1) {
            //do nothing : source for a array
          }
        }
      }
    }
    var atLeastOneProperty = false;
    //console.log('nodeOut intemediate|',
    for (var key in nodeOut) {
      //console.log('property|', key);
      atLeastOneProperty = true;
    }
    if (atLeastOneProperty == false) {
      nodeOut = undefined;
    }

    //console.log(nodeOut);
    return nodeOut;
  },
  postProcess: function(nodeInData, nodeInPostProcess) {



    var nodeOut;

    if (Array.isArray(nodeInData)) {
      nodeOut = [];
      if (nodeInPostProcess[0] != undefined) {
        for (recordData of nodeInData) {
          nodeOut.push(this.postProcess(recordData, nodeInPostProcess[0]));
        }
      } else {
        nodeOut = nodeInData;
      }
    } else if (typeof nodeInPostProcess == 'object') {
      nodeOut = {};
      for (var nodeInDataProperty in nodeInData) {
        if (nodeInPostProcess[nodeInDataProperty] != undefined) {
          if (nodeInPostProcess[nodeInDataProperty].process != undefined) {
            console.log('PostProcess | ', nodeInPostProcess[nodeInDataProperty]);
            var processObject = nodeInPostProcess[nodeInDataProperty];
            var result;
            var nodeInValue = nodeInData[nodeInDataProperty];
            if (processObject.process == 'typeConvertion') {
              if (processObject.type == 'string') {
                result = nodeInValue.toString();
              }else if (processObject.type == 'float') {
                result = parseFloat(nodeInValue.replace(",", "."));
              }
            }
            nodeOut[nodeInDataProperty] = result;
          } else {
            nodeOut[nodeInDataProperty] = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty]);
          }
        } else {
          nodeOut[nodeInDataProperty] = nodeInData[nodeInDataProperty];
        }
      }
      //nodeOut[nodeInDataProperty] = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcessValue)
    }
    return nodeOut;
  },

  unresolveProcess: function(nodeIn, jsonTransformPattern) {
    var nodeOut;
    if (Array.isArray(nodeIn)) {
      nodeOut = [];
    } else {
      nodeOut = {};
    }

    for (var key in nodeIn) {
      if (nodeIn[key] == undefined) {

        if (typeof jsonTransformPattern[key] == 'string' && jsonTransformPattern[key].indexOf('$') != -1) {
          nodeOut[key] = '';
        } else {
          //console.log('unresolveProcess | ',key,'|',jsonTransformPattern[key]);
          nodeOut[key] = jsonTransformPattern[key];
        }
      } else {
        //nodeOut[key] = nodeIn[key];
        if (typeof nodeIn[key] == 'object') {
          if (Array.isArray(nodeIn)) {

            nodeOut.push(this.unresolveProcess(nodeIn[key], jsonTransformPattern[1]));

          } else {
            nodeOut[key] = this.unresolveProcess(nodeIn[key], jsonTransformPattern[key]);
          }
        } else {
          nodeOut[key] = nodeIn[key];
        }

      }
    }
    //console.log('unresolveProcess intermediate| ',nodeOut);
    return nodeOut;
  },
  test: function(data, flowData) {
    //console.log('Object Transformer | test : ',data,' | ',flowData[0].length);
    return new Promise((resolve, reject) => {
      resolve(this.jsonTransform(flowData[0], data.specificData.transformObject));
    })
  }
}
