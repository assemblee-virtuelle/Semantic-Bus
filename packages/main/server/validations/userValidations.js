const t = require('io-ts');
const common = require('./common');
const { patterns } = require('@semantic-bus/core/helpers');

/**
 * @typedef {{
 *   name: string,
 *   society?: string,
 *   job?: string
 * }} ProfilPatch
 */

/** @type {Decoder<ProfilPatch>} */
const userPatchType = t.exact(t.type({
  name: t.string,
  society: common.optionalRegex(patterns.job, () => 'Le nom de la société ne respecte pas le format attendu.'),
  job: common.optionalRegex(patterns.job, () => 'Le nom du job ne respecte pas le format attendu.')
}), 'ProfilPatch');

module.exports = {
  userPatchType
};
