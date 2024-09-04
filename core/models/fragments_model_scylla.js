const client = require('../db/scylla_client');
const zlib = require('zlib');
const Fragment = require('../model_schemas/fragments_schema_scylla');
const { log } = require('console');

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
const searchFragmentByField = async (searchCriteria, sortOptions) => {
  searchCriteria = processCriteriaAndOptions(searchCriteria); // Appel de la fonction utilitaire
  sortOptions = processCriteriaAndOptions(sortOptions); // Appel de la fonction utilitaire

  const fieldNames = Object.keys(searchCriteria);
  const fieldValues = Object.values(searchCriteria);
  
  const whereClauses = fieldNames.map(field => `${field} = ?`);
  const whereClause = whereClauses.join(' AND ');

  const queryString = `SELECT * FROM fragment WHERE ${whereClause}`;
  const result = await client.execute(queryString, fieldValues, { prepare: true });

  let rows = result.rows;
  if (sortOptions) {
    rows.sort((a, b) => {
      for (const [key, order] of Object.entries(sortOptions)) {
        const orderLower = order.toLowerCase(); // Convertir en minuscule
        if (a[key] < b[key]) return orderLower === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return orderLower === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  rows = rows.map(row => processFragment(row));

  return rows;
};

const updateMultipleFragments = async (searchCriteria, updateFields) => {

  searchCriteria = processCriteriaAndOptions(searchCriteria); // Appel de la fonction utilitaire
  updateFields = processCriteriaAndOptions(updateFields); // Appel de la fonction utilitaire
  // if (updateFields?.index) {
  //   updateFields.indexArray = updateFields.index;
  // }
  // if (updateFields?.maxIndex) {
  //   updateFields.maxIndexArray = updateFields.maxIndex;
  // }
  // if (searchCriteria?.index) {
  //   searchCriteria.indexArray = searchCriteria.index;
  // }
  // if (searchCriteria?.maxIndex) {
  //   searchCriteria.maxIndexArray = searchCriteria.maxIndex;
  // }
  delete updateFields.index; // Suppression de index
  delete updateFields.maxIndex; // Suppression de maxIndex
  delete searchCriteria.index; // Suppression de index
  delete searchCriteria.maxIndex; // Suppression de maxIndex
  const fields = Object.keys(updateFields);
  const values = Object.values(updateFields);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const whereClause = Object.keys(searchCriteria).map(field => `${field} = ?`).join(' AND ');
  const query = `UPDATE fragment SET ${setClause} WHERE ${whereClause}`;
  const queryValues = [...values, ...Object.values(searchCriteria)];
  await client.execute(query, queryValues, { prepare: true });
};

module.exports = {
  insertFragment,
  updateFragment,
  persistFragment,
  getFragmentById,
  searchFragmentByField,
  updateMultipleFragments,
  model: Fragment
};
