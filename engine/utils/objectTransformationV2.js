'use strict'
// need NodeJs >=12

module.exports = {
  Intl: require('intl'),
  moment : require('moment'),
  dotProp: require('dot-prop'),
  unicode : require('unicode-encode'),
  executeWithParams: function(source, pullParams, jsonTransformPattern, options) {
    let out = this.execute(source, pullParams, jsonTransformPattern, options)
    return out
  },

  execute: function(source, pullParams, jsonTransformPattern, options) {
    // console.log('jsonTransformPattern',jsonTransformPattern);
    if (source == undefined) {
      return undefined;
    } else if (typeof jsonTransformPattern === 'string' || jsonTransformPattern instanceof String) {
      const regexpeEval = /^\=(.*)/gm;
      const arrayRegexEval = [...jsonTransformPattern.matchAll(regexpeEval)]
      if (arrayRegexEval.length > 0) {
        let patternEval = arrayRegexEval[0][1];
        const regexpeDot = /{(.*?)}/gm;
        const arrayRegexDot = [...patternEval.matchAll(regexpeDot)];
        for (const valueDot of arrayRegexDot) {
          let sourceDotValue = this.getValueFromSource(source,pullParams, valueDot[1]);
          // sourceDotValue= this.escapeString(sourceDotValue);
          // console.log('sourceDotValue',sourceDotValue, typeof sourceDotValue);

          if(typeof sourceDotValue === 'string' || sourceDotValue instanceof String){
            sourceDotValue = "this.resolveString('"+this.escapeString(sourceDotValue)+"')"
          }else if (typeof sourceDotValue === 'object') {
            // sourceDotValue ='JSON.parse(`' + JSON.stringify(sourceDotValue) + '`)'
            sourceDotValue = "this.parseAndResolveString('" + JSON.stringify(this.escapeString(sourceDotValue)) + "')";
          }
          patternEval = patternEval.replace(valueDot[0], sourceDotValue);
        }
        try {
          // console.log('main RESOLVE',patternEval);
          const evalResult = eval(patternEval);
          if(options  && options.evaluationDetail==true){
            return {eval:evalResult};
          }else{
            return evalResult;
          }
        } catch (e) {
          console.log(e);
          if(options  && options.evaluationDetail==true){
            // console.log('ERROR:',javascriptEvalString);
            return {
              error: 'Javascript Eval failed',
              errorDetail: {
                evalString: patternEval,
                cause: e.message
              }
            }
          }
        }
      } else {
        return this.getValueFromSource(source,pullParams, jsonTransformPattern);
      }
    } else if (Array.isArray(jsonTransformPattern)) {
      return jsonTransformPattern.map((r, i) => this.execute(source,pullParams, r, options))
    } else if(typeof jsonTransformPattern === 'object') {
      let out = {};
      for (const jsonTransformPatternKey in jsonTransformPattern) {
        // const jsonTransformPatternValue = jsonTransformPattern[jsonTransformPatternKey]
        out[jsonTransformPatternKey] = this.execute(source, pullParams, jsonTransformPattern[jsonTransformPatternKey], options)
      }
      return out
    } else {
      return jsonTransformPattern
    }
  },
  getValueFromSource(source,pullParams, pattern) {
    if (pattern.localeCompare('$..') == 0) {
      return source;
    } else {
      let regexp = /\$\.(.*)/gm;
      let arrayRegex = [...pattern.matchAll(regexp)];
      let regexpPull = /\£\.(.*)/gm;
      let arrayRegexPull = [...pattern.matchAll(regexpPull)];
      if (arrayRegex.length > 0) {
        const dotPath = arrayRegex[0][1];
        return this.dotProp.get(source, dotPath);
      }else if (arrayRegexPull.length > 0) {
        const dotPath = arrayRegexPull[0][1];
        return this.dotProp.get(pullParams, dotPath);
      } else {
        return pattern;
      }
    }
  },
  escapeString(source){
    if(typeof source === 'string' || source instanceof String){
      // return '`${source}`'
      // return `eval(\`${source}\`)`
      return `eval(this.unicode.atou(\`${this.unicode.utoa(source)}\`))`
      // return \
    } else if(Array.isArray(source)){
      return source.map(r=>this.escapeString(r))
    } else if (typeof source === 'object') {
      let out={}
      for (const key in source){
        out[key]=this.escapeString(source[key]);
      }
      return out
    }else{
      return source;
    }
  },
  parseAndResolveString(source){
    return(this.resolveString(JSON.parse(source)))
  },
  resolveString(source){
    if(typeof source === 'string' || source instanceof String){
      let regexp = /eval\((.*)\)/gm;
      let arrayRegex = [...source.matchAll(regexp)];
      if(arrayRegex.length>0){
        return eval(arrayRegex[0][1]);
      }else {
        return source;
      }

    } else if(Array.isArray(source)){
      return source.map(r=>this.resolveString(r))
    } else if (typeof source === 'object') {
      let out={}
      for (const key in source){
        out[key]=this.resolveString(source[key]);
      }
      return out
    }else{
      return source;
    }
  }
}
