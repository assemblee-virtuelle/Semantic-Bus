const GenerictModel = require('./generic_model_scylla');
const Fragment = require('../model_schemas/fragments_schema_scylla');
const fields = [
  { name: 'id', requiresToString: true, isIndexed: true },
  { name: 'data', isCompressed: true },
  { name: 'originFrag', requiresToString: true, isIndexed: true, indexName: 'OriginFragIndex' },
  { name: 'rootFrag', requiresToString: true },
  { name: 'branchOriginFrag', requiresToString: true, isIndexed: true, indexName: 'BranchOriginFragIndex' },
  { name: 'branchFrag', requiresToString: true },
  { name: 'garbageTag', defaultValue: false, isIndexed: true, indexName: 'GarbageTagIndex' },
  { name: 'garbageProcess', isIndexed: true, indexName: 'GarbageProcessIndex' },
  { name: 'indexArray' },
  { name: 'maxIndexArray' }
];

const fragmentModelInstance = new GenerictModel('fragment', fields, Fragment);

// console.log('fragmentModelInstance', fragmentModelInstance);

module.exports = fragmentModelInstance; 