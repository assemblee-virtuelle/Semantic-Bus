# Matrice de compatibilité — usages réels de production

> Extrait de la base de production MongoDB (`semantic-bus-prod-all`, collection
> `workspacecomponents`, champ `specificData`), pour valider la compatibilité de
> l'implémentation sécurisée (eval validé par AST + worker + crypto exposé).
> Date d'extraction : août 2026.

## Méthodologie
Connexion en lecture seule à la base prod, analyse des `specificData` des composants
utilisant des expressions JS (`= expr`, `$where`) : `jsEvaluation.jsString`,
`objectTransformer.transformObject`, `filter.filterString`, `arraySplitByCondition.conditionString`.

## Volumétrie
- **Total composants prod** : 8 604
- **Composants avec expressions JS** :
  - `objectTransformer` avec `=` : **937**
  - `filter` avec `$where` : **316**
  - `jsEvaluation` : **90**
  - `arraySplitByCondition` avec `$where` : **0**
  - `sort` : **1**

## Libs réellement utilisées dans les expressions (occurrences)
| Lib | Occurrences | Supporté | Note |
|---|---|---|---|
| `he` (he.decode/he.encode) | 485 | ✅ | couvert par les tests |
| `dayjs` | 36 | ✅ | couvert |
| `moment` / `this.moment` | 2 | ✅ | couvert |
| `crypto` (createHash, randomUUID) | 4 | ✅ | **restauré** (exposé dans le worker) |
| `removeMarkdown` | 5 | ✅ | couvert |
| `decodeUnicode` | 5 | ✅ | couvert |
| `sanitizeHtml` | 4 | ✅ | couvert |
| `cheerio` | 1 | ✅ | couvert |
| `_` | (254 « occurrences ») | — | **faux positifs** : `_` est un caractère (ex. `lib[0]['_']`, `$.guid.0._`, `.replace(' ','_')`), PAS la lib underscore |

## Cas de compatibilité — résolus
Identifiants initialement interdits mais présents en prod (**5 composants sur 8 604**),
**désormais supportés** (aucune casse) :

| # | Pattern | Nb composants | Exemple réel | Résolution |
|---|---|---|---|---|
| 1 | `eval('new ' + ...)` (construction de Date) | 3 | `=(eval('new '+{$.date})).getDate()+'/'+...` | ✅ `eval` autorisé dans le worker **isolé** : `require`/`module`/`process`/`global`/`console` sont retirés du `globalThis` du worker (`workerGlobals.js`) → un `eval` interne ne peut PAS accéder au système. Timeout appliqué. |
| 2 | `Buffer.from(...).toString('base64')` | 2 | `=...'-'+Buffer.from({$.start}).toString('base64')` | ✅ `Buffer` est un global Node conservé dans le worker (usage sûr d'encodage, pas d'accès système). |

Autres identifiants interdits (`process`, `require`, `fs`, `path`, `child_process`, `os`...) :
**aucun usage réel** en prod (vérifié par mot entier, hors faux positifs de sous-chaînes
comme « rdfs », « thesaurus »). → L'interdiction reste sûre et sans casse.

> **Compromis de sécurité assumé** : `eval` est autorisé au niveau du validateur pour la
> compatibilité, MAIS la barrière de sécurité effective est le **worker_threads isolé** :
> `require`/`process`/`fs`/etc. ne sont PAS accessibles dans le worker (supprimés de
> `globalThis` avant toute évaluation), et un timeout termine toute exécution abusive.
> Le `$where` et les transformations passent par ce mécanisme.

## Recommandation
- Les **8 604 composants prod** sont **tous compatibles** avec l'implémentation sécurisée
  (les 5 cas eval/Buffer étant supportés via le worker isolé, sans réécriture de config).

## Tests d'acceptation (patterns prod réels)
Implémentés dans `compatibilityMatrix.test.js` (extraits de prod) :
- `= {$.rlcStartDate}!==undefined?this.moment({$.rlcStartDate},'YYYY-MM-DD').format('DD/MM/YYYY'):undefined`
- `= dayjs({$.start}).format('DD-MM-YYYY')`
- `= he.decode({$.pairs})`
- `= crypto.createHash("sha256").update(x).digest("hex")`
- `= (eval("new " + {$.date})).getDate()` (construction de Date, prod)
- `= Buffer.from({$.start}).toString("base64")` (encodage, prod)

Et tests de sécurité runtime (dans `objectTransformationV2.test.js`) :
- `eval("require('fs')...")` → **échoue** (require retiré du worker, pas de RCE)
- `eval("process.env")` → **échoue** (process retiré du worker)
