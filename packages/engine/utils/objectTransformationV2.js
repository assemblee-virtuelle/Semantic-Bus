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
const { validateExpression } = require('./validateExpression.js');
const { sanitizeValue, runEvalInRemote } = require('./evalSecurity.js');
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



module.exports = {
  // Intl: require('intl'),
  moment: require('moment'),
  dotProp: require('dot-prop'),
  executeWithParams: async function (source, pullParams, jsonTransformPattern, options, config) {
    // console.log('config',config);
    const out = await this.execute(source, pullParams, jsonTransformPattern, options, config);
    return out;
  },

  execute: async function (source, pullParams, jsonTransformPattern, options, config) {

    if (typeof jsonTransformPattern === 'string' || jsonTransformPattern instanceof String) {
      const regexpeEval = /^\=(.*)/gm;
      const arrayRegexEval = [...jsonTransformPattern.matchAll(regexpeEval)];
      if (arrayRegexEval.length > 0) {
        let patternEval = arrayRegexEval[0][1];
        let patternEvalPretty = patternEval;
        const regexpeDot = /{(\$.*?|£.*?)}/gm;
        const arrayRegexDot = [...patternEval.matchAll(regexpeDot)];
        const logEval = false;
        // Résolution des valeurs {$.path}/{£.path} À L'EXTÉRIEUR du container
        // d'évaluation : on remplace chaque motif par un nom de variable
        // (v0, v1, ...) et on collecte les valeurs (sanitisées) dans `variables`,
        // envoyées SÉPARÉMENT au eval-service. Le container ne reçoit que
        // l'expression épurée + les variables, il ne fait QUE l'évaluation.
        const variables = {};
        let varIndex = 0;
        for (const valueDot of arrayRegexDot) {
          // SÉCURITÉ : sanitise la valeur (filtre clés dangereuses __proto__/
          // constructor/prototype + getters) avant envoi.
          const rawValue = this.getValueFromSource(source, pullParams, valueDot[1]);
          const sourceDotValue = sanitizeValue(rawValue);
          const varName = `v${varIndex++}`;
          variables[varName] = sourceDotValue === undefined ? null : sourceDotValue;
          patternEval = patternEval.replace(valueDot[0], varName);
          patternEvalPretty = patternEvalPretty.replace(valueDot[0], JSON.stringify(sourceDotValue));
        }
        // Les expressions de prod peuvent référencer `source`/`pullParams`
        // directement (ex. `= source.data.map(...)`). On les expose en variables.
        variables.source = sanitizeValue(source);
        variables.pullParams = sanitizeValue(pullParams);
        try {
          // SÉCURITÉ : validation statique de l'expression épurée AVANT toute
          // évaluation. Bloque process/require/globalThis/constructor/__proto__/...,
          // limite `new`, interdit les structures de code (boucles, fonctions, I/O).
          validateExpression(patternEval);
          // SÉCURITÉ : exécution dans le eval-service (container isolé), appelé en
          // HTTP signé. Pas de fallback : une erreur réseau/timeout lève ici.
          const evalResult = await runEvalInRemote(patternEval, variables, (config && config.evalTimeoutMs) || 10000);
          // console.log('-> evalResult',evalResult)
          return evalResult;
        } catch (e) {
          // console.error(e)
          // console.log('config',config.quietLog );
          if (config != undefined && config.quietLog != true) {
            console.warn(`Transformer Javascript Error : ${e.message}`);
          }
          return {
            error: 'Javascript Eval failed',
            errorDetail: {
              evalString: patternEvalPretty,
              cause: e.message
            }
          };
        }
      } else {
        return this.getValueFromSource(source, pullParams, jsonTransformPattern);
      }
    } else if (Array.isArray(jsonTransformPattern)) {
      const results = [];
      for (let i = 0; i < jsonTransformPattern.length; i++) {
        results.push(await this.execute(source, pullParams, jsonTransformPattern[i], options, config));
      }
      return results;
    } else if (typeof jsonTransformPattern === 'object') {
      const out = {};
      for (const jsonTransformPatternKey in jsonTransformPattern) {
        // const jsonTransformPatternValue = jsonTransformPattern[jsonTransformPatternKey]
        out[jsonTransformPatternKey] = await this.execute(source, pullParams, jsonTransformPattern[jsonTransformPatternKey], options, config);
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
  }
};
