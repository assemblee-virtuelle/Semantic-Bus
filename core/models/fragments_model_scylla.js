const client = require('../db/scylla_client');
const zlib = require('zlib');
const Fragment = require('../model_schemas/fragments_schema_scylla');
const { validate: uuidValidate } = require('uuid');

const insertFragment = async (fragment) => {
  const query = `
    INSERT INTO fragment (id, data, originFrag, rootFrag, branchOriginFrag, branchFrag, garbageTag, garbageProcess, indexArray, maxIndexArray)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  let compressedJsonData;
  if (fragment?.data) {
    compressedJsonData = zlib.deflateSync(Buffer.from(JSON.stringify(fragment.data), 'utf-8'));
  }


  const insertResult = await client.execute(query, [
    fragment.id,
    compressedJsonData,
    fragment.originFrag,
    fragment.rootFrag,
    fragment.branchOriginFrag,
    fragment.branchFrag,
    fragment.garbageTag,
    fragment.garbageProcess,
    fragment.index !== undefined ? fragment.index : null, // Changement de index en indexArray
    fragment.maxIndex !== undefined ? fragment.maxIndex : null // Ajout de maxIndex
  ], { prepare: true });

  return fragment;
};

const updateFragment = async (fragment) => {
  const query = `
    UPDATE fragment 
    SET data = ?, originFrag = ?, rootFrag = ?, branchOriginFrag = ?, branchFrag = ?, garbageTag = ?, garbageProcess = ?, indexArray = ?, maxIndexArray = ?
    WHERE id = ?
  `;

  let compressedJsonData;
  if (fragment?.data) {
    compressedJsonData = zlib.deflateSync(Buffer.from(JSON.stringify(fragment.data), 'utf-8'));
  } else {
    compressedJsonData = null;
  }

  const updatedFields = [
    compressedJsonData,
    fragment.originFrag !== undefined ? fragment.originFrag : null,
    fragment.rootFrag !== undefined ? fragment.rootFrag : null,
    fragment.branchOriginFrag !== undefined ? fragment.branchOriginFrag : null,
    fragment.branchFrag !== undefined ? fragment.branchFrag : null,
    fragment.garbageTag !== undefined ? fragment.garbageTag : null,
    fragment.garbageProcess !== undefined ? fragment.garbageProcess : null,
    fragment.index !== undefined ? fragment.index : null, // Changement de index en indexArray
    fragment.maxIndex !== undefined ? fragment.maxIndex : null, // Ajout de maxIndex
    fragment.id
  ];

  await client.execute(query, updatedFields, { prepare: true });

  return fragment;

};

const persistFragment = async (fragment) => {
  const checkQuery = `SELECT id FROM fragment WHERE id = ?`;
  const result = await client.execute(checkQuery, [fragment.id], { prepare: true });

  if (result.rowLength > 0) {
    return await updateFragment(fragment);
  } else {
    return await insertFragment(fragment);
  }
};

const processFragment = (fragmentData) => {
  if (fragmentData?.data) {
    fragmentData.data = JSON.parse(zlib.inflateSync(fragmentData.data).toString('utf-8'));
  }
  fragmentData.id = fragmentData.id.toString(); // Ajout de toString sur id
  // indexArray and maxIndexArray to index and maxIndex are in the scope of new Fragment
  return new Fragment(fragmentData);
};

// Fonction utilitaire pour traiter les critères et options
const processCriteriaAndOptions = (criteria) => {
  if (criteria?.index) {
    criteria.indexarray = criteria.index;
    delete criteria.index;
  }
  if (criteria?.maxIndex) {
    criteria.maxIndexarray = criteria.maxIndex;
    delete criteria.maxIndex;
  }
  return criteria
};


const getFragmentById = async (id) => {
  const query = `SELECT * FROM fragment WHERE id = ?`;
  const result = await client.execute(query, [id], { prepare: true });

  if (result.rowLength > 0) {
    const fragmentData = result.rows[0];
    return processFragment(fragmentData); // Utilisation de processFragment
  } else {
    throw new Error(`Fragment with ID ${id} not found`);
  }
};


// Mise à jour de searchFragmentByField
const searchFragmentByField = async (searchCriteria = {}, sortOptions = {}, selectedFields = {}) => {
  // Traitement des critères et options
  searchCriteria = processCriteriaAndOptions(searchCriteria); // Appel de la fonction utilitaire
  sortOptions = processCriteriaAndOptions(sortOptions); // Appel de la fonction utilitaire

  const fieldNames = Object.keys(searchCriteria);
  
  const whereClauses = fieldNames.map(field => {
    if (Array.isArray(searchCriteria[field])) {
      return `${field} IN (${searchCriteria[field].map(value => {
        if (uuidValidate(value)) {
          return value;
        }
        return typeof value === 'string' ? `'${value}'` : value;
      }).join(', ')})`;
    }
    if (uuidValidate(searchCriteria[field])) {
      return `${field} = ${searchCriteria[field]}`;
    }
    return `${field} = ${typeof searchCriteria[field] === 'string' ? `'${searchCriteria[field]}'` : searchCriteria[field]}`;
  });
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''; // Ajout conditionnel de WHERE

  const selectedFieldNames = Object.keys(selectedFields).filter(field => selectedFields[field] === 1).join(', ') || '*';
  const queryString = `SELECT ${selectedFieldNames} FROM fragment ${whereClause}`; // Requête commune

  // Ajout de la requête de comptage
  const countQueryString = `SELECT COUNT(*) FROM fragment ${whereClause}`;
  console.log('SEARCH countQueryString : ', countQueryString);
  const countResult = await client.execute(countQueryString); // Exécution de la requête de comptage
  console.log('SEARCH countResult : ', countResult.rows[0]['count'].toInt());
  console.log('SEARCH queryString : ', queryString);
  const result = await client.execute(queryString); // Exécution de la requête complète
  console.log('SEARCH result : ', result);
  let rows = result.rows;
  if (sortOptions) {
    rows.sort((a, b) => {
      for (const [key, order] of Object.entries(sortOptions)) {
        const orderLower = order.toLowerCase();
        if (a[key] < b[key]) return orderLower === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return orderLower === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  return rows.map(row => processFragment(row)); // Traitement des résultats
};

const updateMultipleFragments = async (searchCriteria, updateFields) => {
  updateFields = processCriteriaAndOptions(updateFields); // Appel de la fonction utilitaire

  const fields = Object.keys(updateFields);
  const values = Object.values(updateFields);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  // Récupérer les fragments à mettre à jour
  const fragmentsToUpdate = await searchFragmentByField(searchCriteria, null, { id: 1 });
  const idsToUpdate = fragmentsToUpdate.map(fragment => fragment.id);

  if (idsToUpdate.length === 0) return; 

  // Diviser les IDs en lots de 100
  const batchSize = 100;
  for (let i = 0; i < idsToUpdate.length; i += batchSize) {
    const batchIds = idsToUpdate.slice(i, i + batchSize);
    const whereClause = `id IN (${batchIds.map(() => '?').join(', ')})`;
    const query = `UPDATE fragment SET ${setClause} WHERE ${whereClause}`;
    const queryValues = [...values, ...batchIds];

    await client.execute(query, queryValues, { prepare: true });
  }
};

const deleteManyFragments = async (searchCriteria) => {
  searchCriteria = processCriteriaAndOptions(searchCriteria);
  const toGarbage = await searchFragmentByField(searchCriteria,undefined, {id: 1});
  console.log('fragment to Delete : ', toGarbage.length)
  const idsToDelete = toGarbage.map(fragment => fragment.id);
  if (idsToDelete.length === 0) return; 

  // Diviser les IDs en lots de 100
  const batchSize = 100;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batchIds = idsToDelete.slice(i, i + batchSize);
    const whereClause = `id IN (${batchIds.map(() => '?').join(', ')})`;
    const query = `DELETE FROM fragment WHERE ${whereClause}`;
    await client.execute(query, batchIds, { prepare: true });
  }
  // console.log(`${idsToDelete.length} fragments deleted`);
};

const countDocuments = async (searchCriteria) => {
  const ids = await searchFragmentByField(searchCriteria, undefined, { id: 1 }); // Sélectionne uniquement les IDs
  // console.log('countDocuments : ', ids.length,searchCriteria)
  return ids.length; // Retourne le nombre d'IDs trouvés
};

module.exports = {
  insertFragment,
  updateFragment,
  persistFragment,
  getFragmentById,
  searchFragmentByField,
  find: searchFragmentByField,
  updateMultipleFragments,
  updateMany: updateMultipleFragments,
  deleteMany: deleteManyFragments,
  deleteManyFragments,
  countDocuments, // Ajout de la nouvelle fonction
  model: Fragment
};
