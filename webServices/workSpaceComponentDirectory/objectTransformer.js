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
    //var transformResult = transform(req.query.data, req.query.transformPattern);
    //console.log(source);
    //console.log(jsonTransformPattern);
    var transformResult = this.transform(source, jsonTransformPattern);
    //console.log('result : ', transformResult);
    //console.log(Object.keys(transformResult)[0], Object.keys(transformResult)[0] == 'undefined');
    //report result simple array at root
    if (Object.keys(transformResult)[0] == 'undefined') {
      transformResult = transformResult['undefined'];
    }

    //console.log('jsonTransform | resultBeforUnresolved |',transformResult);

    var destResult;
    /*  if (transformResult instanceof Array) {
        destResult = [];
        for (record of transformResult) {
          destResult.push(this.unresolveProcess(record, jsonTransformPattern[1]));
        }
      } else {*/
    destResult = this.unresolveProcess(transformResult, jsonTransformPattern)
      /*}*/



    return destResult;
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
        //console.log('unresolveProcess | ',key,'|',jsonTransformPattern);
        if (typeof jsonTransformPattern[key] == 'string' && jsonTransformPattern[key].indexOf('$') != -1) {
          nodeOut[key] =  '';
        } else {
          nodeOut[key] = jsonTransformPattern[key];
        }
      } else {


        //nodeOut[key] = nodeIn[key];
        if (typeof nodeIn[key] == 'object') {
          //console.log('unresolveProcess | key | ', key, ' | array | ', Array.isArray(nodeIn), ' | nodeIn |', nodeIn);
          //console.log('unresolveProcess | node[key] | ', nodeIn[key]);
          //console.log('unresolveProcess | pattern | ', jsonTransformPattern[key]);
          if (Array.isArray(nodeIn)) {
            //console.log('unresolveProcess | array | ', nodeOut);
            nodeOut.push(this.unresolveProcess(nodeIn[key], jsonTransformPattern[1]));

          } else {
            nodeOut[key] = this.unresolveProcess(nodeIn[key], jsonTransformPattern[key]);
          }
        } else {
          nodeOut[key] = nodeIn[key];
        }

      }
    }
    return nodeOut;
  },
  test: function(data, flowData) {
    //console.log('Object Transformer | test : ',data,' | ',flowData[0].length);
    return new Promise((resolve, reject) => {
      resolve(this.jsonTransform(flowData[0], data.specificData.transformObject));
    })
  }
}
