'use strict';
//console.log("Datatraitment module initialize")

module.exports = {
  transform: require('jsonpath-object-transform'),
  executeWithParams: function(source, pullParams, jsonTransformPattern) {
    let out = this.execute(source, jsonTransformPattern);
    // console.log('out',out);
    if (pullParams != undefined) {
      let newJsonTransformPattern = this.convertOperatorParams(jsonTransformPattern);
      // console.log("newJsonTransformPattern", newJsonTransformPattern, pullParams);
      let out2 = this.execute(pullParams, newJsonTransformPattern);
      console.log('out1', out);
      console.log('out2', out2);
      out = this.mergeParams(out, out2);
      console.log('mergeParams', out);
    }
    console.log('executeWithParams',out);
    return out;
  },
  convertOperatorParams(newJsonTransformPattern) {

    if (typeof newJsonTransformPattern == 'string') {
      newJsonTransformPattern = newJsonTransformPattern.replace(/£./g, '$.');
    } else if (typeof newJsonTransformPattern == 'object') {
      for (let key in newJsonTransformPattern) {
        newJsonTransformPattern[key] = this.convertOperatorParams(newJsonTransformPattern[key]);
      }
    }

    return newJsonTransformPattern;
  },

  mergeParams(pushFlow, pullFlow) {
    console.log('ALLO1111111111111111111111');
    // console.log('pushFlow',typeof pushFlow ,pushFlow );
    if (typeof pushFlow == 'object') {
      for (let key in pushFlow) {
        // console.log('pushFlow[key]',pushFlow[key]);
        // console.log('pullFlow[key]',pullFlow[key]);
        if (pushFlow[key] == undefined && pullFlow[key] != undefined) {
          pushFlow[key] = pullFlow[key];
        }else if (pushFlow[key] != undefined && pullFlow[key] == undefined) {
          //noting todo
        } else if (pushFlow[key] != undefined) {
          pushFlow[key] = this.mergeParams(pushFlow[key], pullFlow[key]);
        }
      }
    }
      console.log('ALLO2222222222222222222222');
    return pushFlow;
  },

  execute: function(source, jsonTransformPattern) {
    //console.log("source", source,'jsonTransformPattern', jsonTransformPattern )
    //console.log('Object Transformer | source',source,' | pattern | ',jsonTransformPattern);
    //console.log(source);
    //console.log(jsonTransformPattern);
    //console.log(jsonSchema);
    //source={root:source};
    jsonTransformPattern = {
      root: jsonTransformPattern
    };
    // var array = true;
    // for (var propertyKey in source) {
    //   //console.log(parseInt(propertyKey));
    //   if (isNaN(propertyKey)) {
    //     array = false;
    //     //console.log('BREAK ARRAY');
    //   }
    // }

    if (Array.isArray(source)) {
      var destArray = [];
      for (var propertyKey in source) {
        var record = source[propertyKey];
        destArray.push(record);
      }
      source = destArray;
    }

    // array = true;
    // for (var propertyKey in jsonTransformPattern) {
    //   if (isNaN(propertyKey)) {
    //     array = false;
    //   }
    // }
    if (Array.isArray(jsonTransformPattern)) {
      var destArray = [];
      for (var propertyKey in jsonTransformPattern) {
        var record = jsonTransformPattern[propertyKey];
        destArray.push(record);
      }
      jsonTransformPattern = destArray;
    }



    var dissociatePatternResolvable = this.dissociatePatternResolvable(jsonTransformPattern);
    var dissociatePatternPostProcess = this.dissociatePatternPostProcess(jsonTransformPattern);
    //console.log('resolvable | ', JSON.stringify(dissociatePatternResolvable));
    // console.log('postProcess | ', JSON.stringify(dissociatePatternPostProcess));
    //console.log('resolvable | ', dissociatePatternResolvable);
    //console.log('postProcess | ', dissociatePatternPostProcess);
    //console.log('source | ', JSON.stringify(source));
    //console.log('source | ', source);
    var postProcessResult;
    try {
      var transformResult = this.transform(source, dissociatePatternResolvable);
      // console.log('jsonTransform | resultBeforUnresolved |', JSON.stringify(transformResult));
      //TODO documentation why (seems for array)
      if (Object.keys(transformResult)[0] == 'undefined') {
        transformResult = transformResult['undefined'];
      }
      //console.log('jsonTransform | resultBeforUnresolved |', transformResult);
      var destResult = this.unresolveProcess(transformResult, dissociatePatternResolvable)
      //console.log('jsonTransform | afterUnresolved |', destResult);

      if (dissociatePatternPostProcess == undefined) {
        //console.log('ALLO');
        postProcessResult = destResult;
      } else {
        // console.log('jsonTransform | dissociatePatternPostProcess |', dissociatePatternPostProcess);
        postProcessResult = this.postProcess(destResult, dissociatePatternPostProcess)
      }
      // console.log('jsonTransform | postProcessResult |', postProcessResult);
    } catch (e) {
      //console.log('transform exception',e);
      postProcessResult = source;
    }

    //console.log(postProcessResult);
    return postProcessResult.root;
  },
  dissociatePatternResolvable: function(nodeIn, depth, everArrayPath) {
    if (depth == undefined) {
      depth = 0;
    }

    if (everArrayPath == undefined) {
      everArrayPath = false;
    }
    //console.log(nodeIn);
    //console.log(depth, everArrayPath);
    var nodeOut;
    var arrayHack = false;
    //console.log(nodeIn[0],typeof nodeIn[0],nodeIn[0].indexOf('$..'));
    // if (Array.isArray(nodeIn) && everArrayPath == false && nodeIn[0] != undefined && typeof nodeIn[0] == 'string' && nodeIn[0].indexOf('$.')>=0) {
    //   nodeOut = [];
    //   everArrayPath = true;
    // } else {
    if (Array.isArray(nodeIn)) {
      arrayHack = true;
    }
    nodeOut = {};
    // }

    //console.log(nodeOut);

    for (var key in nodeIn) {
      //console.log('node |', typeof nodeIn[key], ' | ', nodeIn[key]);
      if (typeof nodeIn[key] == 'object') {
        //console.log('----');
        //console.log(key, Array.isArray(nodeOut));
        if (Array.isArray(nodeOut)) {
          nodeOut.push(this.dissociatePatternResolvable(nodeIn[key], depth + 1, everArrayPath));
        } else {
          nodeOut[key] = this.dissociatePatternResolvable(nodeIn[key], depth + 1, everArrayPath);
        }

      } else {
        nodeOut[key] = null;
        if (typeof nodeIn[key] == 'string') {
          const regex = /^=(.*)/g;
          const str = nodeIn[key];
          if (str.match(regex) != null) {
            const regex2 = /{(\$.*?)}/g;
            let elementsRaw = str.match(regex2);
            if (elementsRaw != null) {
              let elements = elementsRaw.map(function(match) {
                return match.slice(1, -1);
              })
              let dispatchParameter = {}
              for (let elementKey in elements) {
                dispatchParameter[elements[elementKey]] = elements[elementKey];
              }
              //console.log(dispatchParameter);
              nodeOut[key] = dispatchParameter;
            }

          }

          if (nodeOut[key] == null) {
            nodeOut[key] = nodeIn[key];
          }
        } else if (typeof nodeIn[key] == 'number') {
          nodeOut[key] = 'N~' + nodeIn[key].toString();
        } else {
          nodeOut[key] = nodeIn[key];
        }
      }
    }
    //console.log(nodeOut);
    return nodeOut;
  },
  dissociatePatternPostProcess: function(nodeIn, depth, everArrayPath) {

    if (depth == undefined) {
      depth = 0;
    }
    if (everArrayPath == undefined) {
      everArrayPath = false;
    }

    var nodeOut;
    var arrayHack = false;
    // if (Array.isArray(nodeIn) && everArrayPath == false && nodeIn[0] != undefined && typeof nodeIn[0] == 'string' && nodeIn[0].indexOf('$.')>=0) {
    //   console.log("ARRAY SKIP");
    //   nodeOut = [];
    //   everArrayPath = true;
    // } else {
    if (Array.isArray(nodeIn)) {
      arrayHack = true;
    }
    nodeOut = {};

    // }

    if (typeof nodeIn == 'string') {
      const regex = /^=(.*)/g;
      const str = nodeIn[key];
      let execResult = regex.exec(str)
      if (execResult != null) {
        nodeOut.process = 'javascriptExec';
        nodeOut.processData = execResult[1]
      };
    }
    if (arrayHack == true) {
      nodeOut.process = 'arrayHack';
    }

    for (var key in nodeIn) {
      //console.log('node |', typeof nodeIn[key], ' | ', nodeIn[key]);
      if (typeof nodeIn[key] == 'object') {
        var dissociatePatternPostProcess = this.dissociatePatternPostProcess(nodeIn[key], depth + 1, everArrayPath);
        if (dissociatePatternPostProcess != undefined) {
          if (Array.isArray(nodeOut)) {
            nodeOut.push(dissociatePatternPostProcess);
          } else {
            nodeOut[key] = dissociatePatternPostProcess;
          }
        }
      } else {

        if (typeof nodeIn[key] == 'string') {
          const regex = /^=(.*)/g;
          const str = nodeIn[key];
          let execResult = regex.exec(str)
          if (execResult != null) {
            nodeOut[key] = {
              process: 'javascriptExec',
              processData: execResult[1]
            };
          }
        } else if (typeof nodeIn[key] == 'number') {
          nodeOut[key] = {
            process: 'numericHack'
          };
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
    //console.log('********'+JSON.stringify(nodeInData),nodeInPostProcess);
    var nodeOut;

    if (Array.isArray(nodeInData)) {
      nodeOut = [];
      if (nodeInPostProcess != undefined && nodeInPostProcess[0] != undefined) {
        for (let recordData of nodeInData) {
          nodeOut.push(this.postProcess(recordData, nodeInPostProcess[0]));
        }
      } else {
        nodeOut = nodeInData;
      }
    } else if (typeof nodeInPostProcess == 'object') {
      nodeOut = {};
      for (var nodeInDataProperty in nodeInData) {
        if (nodeInPostProcess[nodeInDataProperty] != undefined) {
          if (nodeInPostProcess[nodeInDataProperty].process == 'javascriptExec') {
            //if (typeof nodeInPostProcess[nodeInDataProperty] == 'string') {
            //console.log('PostProcess javascriptExec| ', nodeInPostProcess[nodeInDataProperty]);
            var javascriptEvalString = nodeInPostProcess[nodeInDataProperty].processData;
            //console.log('javascriptEvalString |',javascriptEvalString)
            //console.log('nodeInData[nodeInDataProperty] |', nodeInData[nodeInDataProperty]);
            for (let evalParam in nodeInData[nodeInDataProperty]) {
              //console.log(evalParam);
              var evalParamValue = nodeInData[nodeInDataProperty][evalParam];
              //console.log('evalParam |',evalParam,' | evalParamValue | ',evalParamValue);
              //console.log('typeof evalParamValue',typeof evalParamValue);
              //console.log('evalParamValue',typeof evalParamValue);
              if (typeof evalParamValue == 'string') {

                // evalParamValue = evalParamValue.replace(/\\/g, '\\\\')
                //evalParamValue = evalParamValue.replace(/"/g, '\\"')
                //evalParamValue = evalParamValue.replace(/\\/g, 'XXXXXX')
                //evalParamValue = evalParamValue.replace(/\n/g, '\\n')
                //evalParamValue = evalParamValue.replace(/\n/g, 'L24=')
                //evalParamValue = evalParamValue.replace(/\n/g, '')
                //console.log('**********************************');
                //console.log(evalParamValue);
                evalParamValue = '`' + evalParamValue + '`';
              } else if (typeof evalParamValue == 'object') {
                //evalParamValue= 'JSON.parse(\''+JSON.stringify(evalParamValue)+'\')';
                evalParamValue = JSON.stringify(evalParamValue);
                evalParamValue = evalParamValue.replace(/\\/g, "\\\\");
                // evalParamValue = evalParamValue.replace(/'/g, "\\'");
                evalParamValue = "JSON.parse(`" + evalParamValue + "`)";
                //evalParamValue = evalParamValue.replace("'", "X");
                //evalParamValue=evalParamValue.replace(":","X");
                //console.log('evalParamValue |', evalParamValue);

              }
              let regExpValue = new RegExp('({\\' + evalParam + '})', 'g');
              javascriptEvalString = javascriptEvalString.replace(regExpValue, evalParamValue)
            }
            //console.log('javascriptEvalString | ',javascriptEvalString);
            try {
              //console.log('**********************************');
              //console.log(javascriptEvalString);
              nodeOut[nodeInDataProperty] = eval(javascriptEvalString);
              //console.log('eval done',nodeOut[nodeInDataProperty]);
            } catch (e) {
              nodeOut[nodeInDataProperty] = {
                error: 'Javascript Eval failed ',
                evalString: javascriptEvalString,
                cause: e.message
              };
              //console.log('Javascript Eval failed ', javascriptEvalString, e.message);
            }
          } else if (nodeInPostProcess[nodeInDataProperty].process == 'arrayHack') {
            //console.log('arrayHack',nodeInDataProperty);
            var objectToTransform = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty]);
            var arrayTransform = [];
            for (let key in objectToTransform) {
              arrayTransform.push(objectToTransform[key])
            }
            nodeOut[nodeInDataProperty] = arrayTransform;
          } else if (nodeInPostProcess[nodeInDataProperty].process == 'numericHack') {
            //console.log('numericHack');
            nodeOut[nodeInDataProperty] = Number(nodeInData[nodeInDataProperty].substr(2, nodeInData[nodeInDataProperty].length - 2));
          } else {
            nodeOut[nodeInDataProperty] = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty]);
          }
        } else {
          //console.log(nodeInDataProperty);
          nodeOut[nodeInDataProperty] = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty]);

          //nodeOut[nodeInDataProperty] = nodeInData[nodeInDataProperty];
        }
      }
    } else {
      //console.log('COPY');
      nodeOut = nodeInData;
    }
    return nodeOut;
  },

  unresolveProcess: function(nodeIn, jsonTransformPattern) {
    var nodeOut;
    if (Array.isArray(nodeIn)) {
      nodeOut = [];
      //console.log(nodeIn,jsonTransformPattern);
      // if(nodeIn.length==0&&jsonTransformPattern.length>0){
      //   nodeOut=jsonTransformPattern;
      // }
    } else {
      nodeOut = {};
    }
    //console.log('----------'+JSON.stringify(nodeIn));
    for (var key in nodeIn) {
      //console.log(key);
      if (nodeIn[key] == undefined && jsonTransformPattern != undefined) {

        if (typeof jsonTransformPattern[key] == 'string' && (jsonTransformPattern[key].indexOf('$') != -1 || jsonTransformPattern[key].indexOf('£') != -1)) {
          nodeOut[key] = undefined;
        } else {
          //console.log('unresolveProcess | ',key,'|',jsonTransformPattern[key]);
          nodeOut[key] = jsonTransformPattern[key];
        }
      } else if (typeof nodeIn[key] == 'object' && jsonTransformPattern != undefined) {

        if (Array.isArray(nodeIn)) {
          nodeOut.push(this.unresolveProcess(nodeIn[key], jsonTransformPattern[1]));
        } else {
          nodeOut[key] = this.unresolveProcess(nodeIn[key], jsonTransformPattern[key]);

        }
      } else {
        //console.log('CORRECTION');
        nodeOut[key] = nodeIn[key];
      }


      //console.log('ALLO',nodeOut);
    }
    //console.log('unresolveProcess intermediate| ',nodeOut);
    return nodeOut;
  }
}
