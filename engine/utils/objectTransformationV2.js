'use strict';
// need NodeJs >=12
const dayjs = require('dayjs-with-plugins');
const he = require('he');
const Globalize = require('globalize');
const cldrData = require('cldr-data');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const removeMarkdown = require('remove-markdown');
const lodash = require('lodash');
const sanitizeHtml = require('sanitize-html');
const crypto = require('crypto');
// Charger toutes les données CLDR nécessaires pour toutes les locales

const allLocales = cldrData.availableLocales;

const loadCldrData = () => {
  const localesCldrCategories = [
    'main/{locale}/numbers',
    'main/{locale}/currencies',
    'main/{locale}/ca-gregorian',
    'main/{locale}/timeZoneNames',
    'main/{locale}/listPatterns',
    'main/{locale}/units',
    'main/{locale}/measurementSystemNames',
    'main/{locale}/dateFields',
    'main/{locale}/posix'
  ];
  const supplementalsCldrCategories = [
    'supplemental/likelySubtags',
    'supplemental/numberingSystems',
    'supplemental/plurals',
    'supplemental/timeData',
    'supplemental/weekData',
    'supplemental/currencyData',
    'supplemental/aliases',
    'supplemental/parentLocales',
    'supplemental/dayPeriods',
    'supplemental/ordinals',
  ];


  supplementalsCldrCategories.forEach(category => {
    Globalize.load(cldrData(category));
  });

  allLocales.forEach(locale => {
    localesCldrCategories.forEach(category => {
      const path = category.replace('{locale}', locale);
      try {
        Globalize.load(cldrData(path));
        // Globalize.load(
        //   cldrData.entireMainFor(locale),
        //   cldrData.entireSupplemental()
        // );
      } catch (err) {
        console.warn(`Could not load data for locale ${locale}: ${err.message}`);
      }
    });
  });

};

// Initialisation de Globalize avec toutes les locales
loadCldrData();

function decodeUnicode(str) {
  // On définit le pattern : '\\\\u' pour \u et '([\\dA-Fa-f]{4})' pour les 4 chiffres hexadécimaux
  const regex = new RegExp('\\\\u([\\dA-Fa-f]{4})', 'g');
  return str.replace(regex, (match, grp) =>
    String.fromCharCode(parseInt(grp, 16))
  );
}



module.exports = {
  // Intl: require('intl'),
  // moment: require('moment'),
  dotProp: require('dot-prop'),
  unicode: require('unicode-encode'),
  executeWithParams: function (source, pullParams, jsonTransformPattern, options, config) {
    // console.log('config',config);
    const out = this.execute(source, pullParams, jsonTransformPattern, options, config);
    return out;
  },

  execute: function (source, pullParams, jsonTransformPattern, options, config) {

    if (typeof jsonTransformPattern === 'string' || jsonTransformPattern instanceof String) {
      const regexpeEval = /^\=(.*)/gm;
      const arrayRegexEval = [...jsonTransformPattern.matchAll(regexpeEval)];
      if (arrayRegexEval.length > 0) {
        let patternEval = arrayRegexEval[0][1];
        let patternEvalPretty = patternEval;
        const regexpeDot = /{(\$.*?|£.*?)}/gm;
        const arrayRegexDot = [...patternEval.matchAll(regexpeDot)];
        const logEval = false;
        for (const valueDot of arrayRegexDot) {
          // console.log('--valueDot[1]',valueDot[1])
          const sourceDotValue = this.getValueFromSource(source, pullParams, valueDot[1]);
          let sourceDotValueEval = this.getValueFromSource(source, pullParams, valueDot[1]);
          if (typeof sourceDotValueEval === 'string' || sourceDotValueEval instanceof String) {
            sourceDotValueEval = 'this.resolveString(\'' + this.escapeString(sourceDotValueEval) + '\')';
            patternEvalPretty = patternEvalPretty.replace(valueDot[0], `"${sourceDotValue}"`);
          } else if (typeof sourceDotValueEval === 'object') {
            sourceDotValueEval = 'this.parseAndResolveString(\'' + JSON.stringify(this.escapeString(sourceDotValueEval)) + '\')';
            patternEvalPretty = patternEvalPretty.replace(valueDot[0], sourceDotValue);
          } else if (typeof sourceDotValueEval === 'number' || !isNaN(sourceDotValueEval)) {
            // const type = typeof sourceDotValueEval;
            sourceDotValueEval = `Number(${sourceDotValueEval})`;
            patternEvalPretty = patternEvalPretty.replace(valueDot[0], sourceDotValue);
          }
          patternEval = patternEval.replace(valueDot[0], sourceDotValueEval);
        }
        try {
          const evalResult = eval(patternEval);
          // console.log('-> evalResult',evalResult)
          // if (options && options.evaluationDetail == true) {
          //   return { eval: evalResult };
          // } else {
          // console.log('return evalResult',evalResult);
          return evalResult;
          // }
        } catch (e) {
          // console.error(e)
          // console.log('config',config.quietLog );
          if (config != undefined && config.quietLog != true) {
            console.warn(`Transformer Javascript Error : ${e.message}`);
          }
          // if(options  && options.evaluationDetail==true){
          // console.log('ERROR:', patternEval);
          return {
            error: 'Javascript Eval failed',
            errorDetail: {
              evalString: patternEvalPretty,
              cause: e.message
            }
          };
          // }
        }
      } else {
        return this.getValueFromSource(source, pullParams, jsonTransformPattern);
      }
    } else if (Array.isArray(jsonTransformPattern)) {
      return jsonTransformPattern.map((r, i) => this.execute(source, pullParams, r, options, config));
    } else if (typeof jsonTransformPattern === 'object') {
      const out = {};
      for (const jsonTransformPatternKey in jsonTransformPattern) {
        // const jsonTransformPatternValue = jsonTransformPattern[jsonTransformPatternKey]
        out[jsonTransformPatternKey] = this.execute(source, pullParams, jsonTransformPattern[jsonTransformPatternKey], options, config);
      }
      return out;
    } else {
      return jsonTransformPattern;
    }
  },
  getValueFromSource(source, pullParams, pattern) {
    if (pattern.localeCompare('$..') == 0 || pattern.localeCompare('$') == 0) {
      return source;
    } else if (pattern.localeCompare('£..') == 0 || pattern.localeCompare('£') == 0) {
      return pullParams;
    } else {
      const regexp = /\$\.(.*)/gm;
      const arrayRegex = [...pattern.matchAll(regexp)];
      const regexpPull = /\£\.(.*)/gm;
      const arrayRegexPull = [...pattern.matchAll(regexpPull)];
      // console.log('-arrayRegexPull',arrayRegexPull);
      if (arrayRegex.length > 0) {
        const dotPath = arrayRegex[0][1];
        const dotPropResult = this.dotProp.get(source, dotPath);
        return dotPropResult;
      } else if (arrayRegexPull.length > 0) {
        const dotPath = arrayRegexPull[0][1];
        return this.dotProp.get(pullParams, dotPath);
      } else {
        return pattern;
      }
    }
  },
  escapeString(source) {
    // console.log('escapeString',source);
    if (typeof source === 'string' || source instanceof String) {
      // Échappe la chaîne de caractères en utilisant unicode
      return `eval(this.unicode.atou(\`${this.unicode.utoa(source)}\`))`;
    } else if (Array.isArray(source)) {
      return source.map(r => this.escapeString(r));
    } else if (source != null && source.toJSON !== undefined) {
      const out = {};
      const json = source.toJSON();
      return this.escapeString(json);
    } else if (source != null && typeof source === 'object') {
      const out = {};
      for (const key in source) {
        const unicodeKey = this.unicode.utoa(key);
        out[unicodeKey] = this.escapeString(source[key]);
      }
      return out;
    } else {
      return source;
    }
  },
  parseAndResolveString(source) {
    return (this.resolveString(JSON.parse(source)));
  },
  resolveString(source) {
    if (typeof source === 'string' || source instanceof String) {
      const regexp = /eval\((.*)\)/gm;
      const arrayRegex = [...source.matchAll(regexp)];
      if (arrayRegex.length > 0) {
        return eval(arrayRegex[0][1]);
      } else {
        return source;
      }

    } else if (Array.isArray(source)) {
      return source.map(r => this.resolveString(r));
    } else if (source != null && typeof source === 'object') {
      const out = {};
      for (const key in source) {
        const decodeKey = this.unicode.atou(key);
        out[decodeKey] = this.resolveString(source[key]);
      }
      return out;
    } else {
      return source;
    }
  }
};
