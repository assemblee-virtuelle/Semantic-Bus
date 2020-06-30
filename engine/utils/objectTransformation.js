'use strict'

module.exports = {
  transform: require('jsonpath-object-transform'),
  Intl: require('intl'),
  executeWithParams: function(source, pullParams, jsonTransformPattern,options) {
    // console.log('executeWithParams',source);

    let out = this.execute(source, jsonTransformPattern, pullParams != undefined,options)
    // console.log('executeWithParams out',JSON.stringify(out));
    if (pullParams != undefined) {
      //let newJsonTransformPattern = this.convertOperatorParams(jsonTransformPattern)

      let newJsonTransformPattern = this.convertOperatorParams(out)
      // console.log("newJsonTransformPattern", JSON.stringify(newJsonTransformPattern));
      // console.log("pullParams", JSON.stringify(pullParams));
      out = this.execute(pullParams, newJsonTransformPattern,options)
      // console.log('out1', out);
      // console.log('out2', out2);
      // out = this.mergeParams(out, out2)
      // console.log('mergeParams', out);
    }
    // console.log('executeWithParams',out);
    return out
  },
  convertOperatorParams: function(newJsonTransformPattern) {
    if (typeof newJsonTransformPattern === 'string') {
      newJsonTransformPattern = newJsonTransformPattern.replace(/£./g, '$.')
    } else if (typeof newJsonTransformPattern === 'object') {
      for (let key in newJsonTransformPattern) {
        newJsonTransformPattern[key] = this.convertOperatorParams(newJsonTransformPattern[key])
      }
    }

    return newJsonTransformPattern
  },

  mergeParams: function(pushFlow, pullFlow) {
    // console.log('pushFlow',typeof pushFlow ,pushFlow );
    if (typeof pushFlow === 'object') {
      for (let key in pushFlow) {
        // console.log('pushFlow[key]',pushFlow[key]);
        // console.log('pullFlow[key]',pullFlow[key]);
        if (pushFlow[key] == undefined && pullFlow[key] != undefined) {
          pushFlow[key] = pullFlow[key]
        } else if (pushFlow[key] != undefined && pullFlow[key] == undefined) {
          // noting todo
        } else if (pushFlow[key] != undefined) {
          pushFlow[key] = this.mergeParams(pushFlow[key], pullFlow[key])
        }
      }
    }
    return pushFlow
  },

  execute: function(source, jsonTransformPattern, skeepUnresolved,options) {

    // console.log("source", source,'jsonTransformPattern', jsonTransformPattern )
    // console.log('Object Transformer | source',source,' | pattern | ',jsonTransformPattern);
    // console.log(source);
    // console.log(jsonTransformPattern);
    // console.log(jsonSchema);
    // source={root:source};

    jsonTransformPattern = {
      root: jsonTransformPattern
    }
    // var array = true;
    // for (var propertyKey in source) {
    //   //console.log(parseInt(propertyKey));
    //   if (isNaN(propertyKey)) {
    //     array = false;
    //     //console.log('BREAK ARRAY');
    //   }
    // }

    if (Array.isArray(source)) {
      var destArray = []
      for (var propertyKey in source) {
        var record = source[propertyKey]
        destArray.push(record)
      }
      source = destArray
    }

    // array = true;
    // for (var propertyKey in jsonTransformPattern) {
    //   if (isNaN(propertyKey)) {
    //     array = false;
    //   }
    // }
    if (Array.isArray(jsonTransformPattern)) {
      var destArray = []
      for (var propertyKey in jsonTransformPattern) {
        var record = jsonTransformPattern[propertyKey]
        destArray.push(record)
      }
      jsonTransformPattern = destArray
    }

    var dissociatePatternResolvable = this.dissociatePatternResolvable(jsonTransformPattern,undefined,undefined,options)
    var dissociatePatternPostProcess = this.dissociatePatternPostProcess(jsonTransformPattern,undefined,undefined,options)

    // console.log('jsonTransform | postProcess | ', JSON.stringify(dissociatePatternPostProcess));
    // console.log('jsonTransform | resolvable | ', JSON.stringify(dissociatePatternResolvable));
    // console.log('jsonTransform | postProcess | ', dissociatePatternPostProcess);
    // console.log('jsonTransform | resolvable | ', dissociatePatternResolvable);

    // console.log('jsonTransform | source | ', JSON.stringify(source));
    // console.log('jsonTransform | source | ', source);
    var postProcessResult
    try {
      var transformResult = this.transform(source, dissociatePatternResolvable)

      // console.log('jsonTransform | resultBeforUnresolved |', JSON.stringify(transformResult));
      //TODO documentation why (seems for array)
      if (Object.keys(transformResult)[0] == 'undefined') {
        transformResult = transformResult['undefined']
      }

      // console.log('jsonTransform | resultBeforUnresolved |', JSON.stringify(transformResult));
      // console.log('jsonTransform | resultBeforUnresolved |', transformResult);
      var destResult = this.unresolveProcess(transformResult, dissociatePatternResolvable, skeepUnresolved)
      // console.log('jsonTransform | afterUnresolved |', JSON.stringify(destResult));
      // console.log('jsonTransform | afterUnresolved |', destResult);
      // var destResult;
      // // console.log('skeepUnresolved',skeepUnresolved);
      // if(skeepUnresolved!=true){
      //   destResult = this.unresolveProcess(transformResult, dissociatePatternResolvable)
      // }else {
      //   destResult=transformResult;
      // }

      if (dissociatePatternPostProcess == undefined) {
        // console.log('ALLO');
        postProcessResult = destResult
      } else {
        // console.log('jsonTransform | dissociatePatternPostProcess |', dissociatePatternPostProcess);
        postProcessResult = this.postProcess(destResult, dissociatePatternPostProcess)
      }
      // console.log('jsonTransform | postProcessResult |', JSON.stringify(postProcessResult));
    } catch (e) {
      // console.log('transform exception', e);
      postProcessResult = source
    }

    // console.log('postProcessResult',JSON.stringify(postProcessResult));
    return postProcessResult.root
  },
  dissociatePatternResolvable: function(nodeIn, depth, everArrayPath) {

    if (depth == undefined) {
      depth = 0
    }

    if (everArrayPath == undefined) {
      everArrayPath = false
    }
    // console.log(nodeIn);
    // console.log(depth, everArrayPath);
    var nodeOut
    var arrayHack = false
    //console.log(nodeIn[0],typeof nodeIn[0],nodeIn[0].indexOf('$..'));
    // if (Array.isArray(nodeIn) && everArrayPath == false && nodeIn[0] != undefined && typeof nodeIn[0] == 'string' && nodeIn[0].indexOf('$.')>=0) {
    //   nodeOut = [];
    //   everArrayPath = true;
    // } else {
    if (Array.isArray(nodeIn)) {
      arrayHack = true
    }
    nodeOut = {}
    // }

    //console.log(nodeOut);

    for (var key in nodeIn) {
      // console.log('node |', typeof nodeIn[key], ' | ', nodeIn[key]);
      if (typeof nodeIn[key] === 'object' && nodeIn[key] != null) {
        // console.log('----');
        // console.log(key, Array.isArray(nodeOut));
        if (Array.isArray(nodeOut)) {
          nodeOut.push(this.dissociatePatternResolvable(nodeIn[key], depth + 1, everArrayPath))
        } else {
          nodeOut[key] = this.dissociatePatternResolvable(nodeIn[key], depth + 1, everArrayPath)
        }
      } else {
        nodeOut[key] = undefined
        if (nodeIn[key] == null) {
          nodeOut[key] = undefined;
        } else if (typeof nodeIn[key] === 'string') {

          let unicodeRegex = /&#(\d*);/g;
          let unicodeRegexReverse = /{unicode\((\d*)\)}/g;
          let charCodeRegex = /(:)/g;
          let charCodeRegexReverse = /{charcode\((\d*)\)}/g;
          const regex = /^=(.*)/g
          const str = nodeIn[key]
          if (str.match(regex) != null) {
            const regex2 = /{(\$.*?)}/g
            let elementsRaw = str.match(regex2)
            if (elementsRaw != null) {
              let elements = elementsRaw.map(function(match) {
                return match.slice(1, -1)
              })
              let dispatchParameter = {}
              for (let elementKey in elements) {
                dispatchParameter[elements[elementKey]] = elements[elementKey]
              }
              // console.log(dispatchParameter);
              nodeOut[key] = dispatchParameter
            }
          } else {
            if (nodeIn[key].startsWith('(')) {
              nodeOut[key] = nodeIn[key].substring(1);
            }


            if (charCodeRegex.test(nodeIn[key])) {
              nodeOut[key] = nodeIn[key].replace(charCodeRegex, (chn, p, decalage, s) => {
                // console.log('ALLLO',p.charCodeAt(0));
                return '{charcode(' + p.charCodeAt(0) + ')}'
              })
              // console.log('--CharCode-- Injection', key, nodeOut[key]);
            }

            if (unicodeRegex.test(nodeIn[key])) {
              // nodeOut[key] = nodeIn[key].replace(this.unicodeRegex, '{unicode(' + '$&' + ')}');
              nodeOut[key] = nodeIn[key].replace(unicodeRegex, (chn, p, decalage, s) => {
                return '{unicode(' + p + ')}'
              })

              console.log(nodeOut[key]);
            }
          }


          if (nodeOut[key] == undefined) {
            nodeOut[key] = nodeIn[key];
          }
        } else if (typeof nodeIn[key] === 'number') {
          nodeOut[key] = 'N~' + nodeIn[key].toString()
        } else {
          nodeOut[key] = nodeIn[key]
        }
      }
    }
    // console.log(nodeOut);
    return nodeOut
  },
  dissociatePatternPostProcess: function(nodeIn, depth, everArrayPath,options) {
    if (depth == undefined) {
      depth = 0
    }
    if (everArrayPath == undefined) {
      everArrayPath = false
    }

    var nodeOut
    var arrayHack = false
    // if (Array.isArray(nodeIn) && everArrayPath == false && nodeIn[0] != undefined && typeof nodeIn[0] == 'string' && nodeIn[0].indexOf('$.')>=0) {
    //   console.log("ARRAY SKIP");
    //   nodeOut = [];
    //   everArrayPath = true;
    // } else {
    if (Array.isArray(nodeIn)) {
      arrayHack = true
    }
    nodeOut = {}

    // }
    let processes = [];

    // if (typeof nodeIn === 'string') {
    //   const regex = /^=(.*)/g
    //   const str = nodeIn[key]
    //   let execResult = regex.exec(str)
    //   if (execResult != null) {
    //     processes.push({process:'javascriptExec',processData:execResult[1]})
    //     nodeOut.process = 'javascriptExec'
    //     nodeOut.processData = execResult[1]
    //   };
    // }
    if (arrayHack == true) {
      // nodeOut.process = 'arrayHack'
      nodeOut.processes = [{
        process: 'arrayHack'
      }];
      // processes.push({process:'arrayHack'})
    }

    for (var key in nodeIn) {
      // console.log('dissociatePatternPostProcess |', key, '|', typeof nodeIn[key], ' | ', nodeIn[key]);

      if (typeof nodeIn[key] === 'object') {
        var dissociatePatternPostProcess = this.dissociatePatternPostProcess(nodeIn[key], depth + 1, everArrayPath,options)
        if (dissociatePatternPostProcess != undefined) {
          if (Array.isArray(nodeOut)) {
            nodeOut.push(dissociatePatternPostProcess)
          } else {
            nodeOut[key] = dissociatePatternPostProcess
          }
        }
      } else {
        let processes = [];
        if (typeof nodeIn[key] === 'string') {
          let unicodeRegex = /&#(\d*);/g;
          let unicodeRegexReverse = /{unicode\((\d*)\)}/g;
          let charCodeRegex = /(:)/g;
          let charCodeRegexReverse = /{charcode\((\d*)\)}/g;
          const regex = /^=(.*)/g
          const str = nodeIn[key]
          let execResult = regex.exec(str)
          if (execResult != null) {
            // console.log('javascriptExec',execResult[1]);
            processes.push({
              process: 'javascriptExec',
              processData: execResult[1],
              options : options
            });
            // nodeOut[key] = {
            //   process: 'javascriptExec',
            //   processData: execResult[1]
            // }
          } else {
            if (nodeIn[key].startsWith('(')) {
              // nodeOut[key] = {
              //   process: 'firstParenthesis',
              // }
              processes.push({
                process: 'firstParenthesis',
              });
            }

            if (unicodeRegex.test(nodeIn[key])) {
              processes.push({
                process: 'unicode',
              })
              // nodeOut[key] = {
              //   process: 'unicode',
              // }
            }
            // console.log('nodeIn[key]',nodeIn[key],this.charCodeRegex.test(nodeIn[key]));
            // console.log('nodeIn[key]',nodeIn[key],this.charCodeRegex.test(nodeIn[key]));
            if (charCodeRegex.test(nodeIn[key])) {
              processes.push({
                process: 'charcode',
              })
              // nodeOut[key] = {
              //   process: 'charcode',
              // }
              // console.log('--CharCode-- process',key,nodeOut[key]);
            }
          }

        } else if (typeof nodeIn[key] === 'number') {
          processes.push({
            process: 'numericHack'
          })
          // nodeOut[key] = {
          //   process: 'numericHack'
          // }
        }
        if (processes.length > 0) {
          if (nodeOut[key] != undefined && nodeOut[key].processes != undefined) {
            nodeOut[key].processes = nodeOut[key].processes.concat(processes);
          } else {
            nodeOut[key] = {
              processes: processes
            };
          }

        }
      }
    }
    var atLeastOneProperty = false
    //console.log('nodeOut intemediate|',
    for (var key in nodeOut) {
      // console.log('property|', key);
      atLeastOneProperty = true
    }
    if (atLeastOneProperty == false) {
      nodeOut = undefined
    }
    // console.log('nodeOut',nodeOut);
    // console.log(nodeOut);
    return nodeOut
  },
  postProcess: function(nodeInData, nodeInPostProcess) {
    // console.log('********'+JSON.stringify(nodeInData),nodeInPostProcess);
    let unicodeRegex = /&#(\d*);/g;
    let unicodeRegexReverse = /{unicode\((\d*)\)}/g;
    let charCodeRegex = /(:)/g;
    let charCodeRegexReverse = /{charcode\((\d*)\)}/g;
    var nodeOut
    Intl = this.Intl

    if (Array.isArray(nodeInData)) {
      nodeOut = []
      if (nodeInPostProcess != undefined && nodeInPostProcess[0] != undefined) {
        for (let recordData of nodeInData) {
          nodeOut.push(this.postProcess(recordData, nodeInPostProcess[0]))
        }
      } else {
        nodeOut = nodeInData
      }
    } else if (typeof nodeInPostProcess === 'object') {
      nodeOut = {}
      for (var nodeInDataProperty in nodeInData) {

        if (nodeInPostProcess[nodeInDataProperty] != undefined) {
          // console.log('---- POST PROCESS----');
          // console.log('nodeInDataProperty', nodeInDataProperty);
          // console.log('nodeInPostProcess[nodeInDataProperty] ', nodeInPostProcess[nodeInDataProperty]);
          // console.log('nodeInData[nodeInDataProperty]', nodeInData[nodeInDataProperty]);
          if (nodeInPostProcess[nodeInDataProperty].processes != undefined) {
            if (nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'javascriptExec').length > 0) {
              let process = nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'javascriptExec')[0];
              // console.log('-----javascriptExec-----');
              // console.log('nodeInDataProperty', nodeInDataProperty);
              // console.log('nodeInData[nodeInDataProperty]', nodeInData[nodeInDataProperty]);
              // if (typeof nodeInPostProcess[nodeInDataProperty] == 'string') {
              // console.log('PostProcess javascriptExec| ', nodeInPostProcess[nodeInDataProperty]);
              var javascriptEvalString = process.processData;
              // console.log('javascriptEvalString |',javascriptEvalString)
              // console.log('nodeInData[nodeInDataProperty] |', nodeInData[nodeInDataProperty]);
              let consoleLog=false;
              for (let evalParam in nodeInData[nodeInDataProperty]) {
                // console.log('evalParam',evalParam);
                // console.log('evalParam',evalParam,nodeInData[nodeInDataProperty]);
                var evalParamValue = nodeInData[nodeInDataProperty][evalParam]
                // console.log('evalParam |',evalParam,' | evalParamValue | ',evalParamValue);
                //console.log('typeof evalParamValue',typeof evalParamValue);
                //console.log('evalParamValue',typeof evalParamValue);
                if (typeof evalParamValue === 'string') {
                  // evalParamValue = evalParamValue.replace(/\\/g, '\\\\')
                  // evalParamValue = evalParamValue.replace(/"/g, '\\"')
                  // evalParamValue = evalParamValue.replace(/\\/g, 'XXXXXX')
                  // evalParamValue = evalParamValue.replace(/\n/g, '\\n')
                  // evalParamValue = evalParamValue.replace(/\n/g, 'L24=')
                  // evalParamValue = evalParamValue.replace(/\n/g, '')
                  // console.log('**********************************');
                  // console.log(evalParamValue);
                  evalParamValue = '`' + evalParamValue + '`'
                } else if (evalParamValue instanceof Date) {
                  evalParamValue = `new Date('${evalParamValue}')`
                } else if (typeof evalParamValue === 'object') {
                  // console.log('DATE eval',evalParamValue);
                  evalParamValue = JSON.stringify(evalParamValue)
                  evalParamValue = evalParamValue.replace(/\\/g, '\\\\')
                  evalParamValue = 'JSON.parse(`' + evalParamValue + '`)';
                  // console.log('DATE post eval',evalParamValue);
                }
                // console.log('evalParamValue',evalParamValue);
                let regExpValue = new RegExp('({\\' + evalParam + '})', 'g')

                javascriptEvalString = javascriptEvalString.replace(regExpValue, evalParamValue)

              }

              // console.log('javascriptEvalString | ',javascriptEvalString);
              try {
                // console.log('includes',javascriptEvalString.includes('£'));
                if (javascriptEvalString.includes('£')) {
                  nodeOut[nodeInDataProperty] = '=' + javascriptEvalString
                } else {
                  // console.log('**********************************');
                  // console.log(javascriptEvalString);
                  if(process.options  && process.options.evaluationDetail==true){
                    nodeOut[nodeInDataProperty] = {eval:eval(javascriptEvalString)};
                  }else{
                    nodeOut[nodeInDataProperty] = eval(javascriptEvalString);
                  }

                  //console.log('eval done',nodeOut[nodeInDataProperty]);
                }

              } catch (e) {
                if(process.options  && process.options.evaluationDetail==true){
                  // console.log('ERROR:',javascriptEvalString);
                  nodeOut[nodeInDataProperty] = {
                    error: 'Javascript Eval failed',
                    errorDetail: {
                      evalString: javascriptEvalString,
                      cause: e.message
                    }
                  }
                }

                // console.log('Javascript Eval failed ', javascriptEvalString, e.message);
              }
            }
            if (nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'arrayHack').length > 0) {

              // else if (nodeInPostProcess[nodeInDataProperty].process == 'arrayHack') {
              // console.log('arrayHack',nodeInDataProperty);
              var objectToTransform = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty])
              var arrayTransform = []
              for (let key in objectToTransform) {
                arrayTransform.push(objectToTransform[key])
              }
              nodeOut[nodeInDataProperty] = arrayTransform
            }
            if (nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'numericHack').length > 0) {
              // console.log('numericHack');
              nodeOut[nodeInDataProperty] = Number(nodeInData[nodeInDataProperty].substr(2, nodeInData[nodeInDataProperty].length - 2))
            }
            if (nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'firstParenthesis').length > 0) {
              // console.log('numericHack');
              nodeOut[nodeInDataProperty] = '(' + nodeInData[nodeInDataProperty];
            }
            if (nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'unicode').length > 0) {
              nodeOut[nodeInDataProperty] = nodeInData[nodeInDataProperty].replace(unicodeRegexReverse, (chn, p, decalage, s) => {
                return '&#' + p + ';';
              })
            }
            if (nodeInPostProcess[nodeInDataProperty].processes.filter(p => p.process == 'charcode').length > 0) {
              nodeOut[nodeInDataProperty] = nodeInData[nodeInDataProperty].replace(charCodeRegexReverse, (chn, p, decalage, s) => {
                return String.fromCharCode(p);
              })
            }
          } else {
            nodeOut[nodeInDataProperty] = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty])
          }
        } else {
          // console.log(nodeInDataProperty);
          nodeOut[nodeInDataProperty] = this.postProcess(nodeInData[nodeInDataProperty], nodeInPostProcess[nodeInDataProperty])

          //nodeOut[nodeInDataProperty] = nodeInData[nodeInDataProperty];
        }
      }
    } else {
      // console.log('COPY');
      nodeOut = nodeInData
    }
    return nodeOut
  },

  unresolveProcess: function(nodeIn, jsonTransformPattern, ignorePullParam) {
    var nodeOut
    // console.log('nodeIn',nodeIn);
    if (Array.isArray(nodeIn)) {
      nodeOut = []
      //console.log(nodeIn,jsonTransformPattern);
      // if(nodeIn.length==0&&jsonTransformPattern.length>0){
      //   nodeOut=jsonTransformPattern;
      // }
    } else {
      nodeOut = {}
    }
    // console.log('----------'+JSON.stringify(nodeIn));
    for (var key in nodeIn) {
      // console.log(key);
      if (nodeIn[key] == undefined && jsonTransformPattern != undefined) {
        if (typeof jsonTransformPattern[key] === 'string' && (jsonTransformPattern[key].indexOf('$') != -1 || (jsonTransformPattern[key].indexOf('£') != -1 && ignorePullParam != true))) {
          nodeOut[key] = undefined
        } else {
          // console.log('unresolveProcess | ',key,'|',jsonTransformPattern[key]);
          nodeOut[key] = jsonTransformPattern[key]
        }
      } else if (nodeIn[key] instanceof Date) {
        nodeOut[key] = nodeIn[key]
      } else if (typeof nodeIn[key] === 'object' && jsonTransformPattern != undefined) {
        if (Array.isArray(nodeIn)) {
          nodeOut.push(this.unresolveProcess(nodeIn[key], jsonTransformPattern[1], ignorePullParam))
        } else {
          nodeOut[key] = this.unresolveProcess(nodeIn[key], jsonTransformPattern[key], ignorePullParam)

        }
      } else {
        // console.log('CORRECTION');
        nodeOut[key] = nodeIn[key]
      }


    }
    // console.log('nodeOut',nodeOut);
    // console.log('unresolveProcess intermediate| ',nodeOut);
    return nodeOut
  }
}
