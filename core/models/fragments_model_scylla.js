const client = require('../db/scylla_client');
const zlib = require('zlib');
const Fragment = require('../model_schemas/fragments_schema_scylla');
const { validate: uuidValidate } = require('uuid');
const Spinnies = require('spinnies');
const spinnies = new Spinnies();

// Helper function to compress data
const compressData = (data) => {
  // if (data === undefined || data === null) return null;
  // Cas spécial pour une chaîne vide - nous pouvons utiliser un marqueur spécial

  // console.log('___data', JSON.stringify(data)) 
  if (data === ''){
    return Buffer.from('__EMPTY_STRING__');
  } else if (data === undefined){
    return Buffer.from('__UNDEFINED__');
  } else if (data === null){
    return Buffer.from('__NULL__');
  } else { 
    return zlib.deflateSync(Buffer.from(JSON.stringify(data), 'utf-8'));
  }
};

// Helper function to decompress data
const decompressData = (compressedData) => {
  // Vérifier si c'est notre marqueur de chaîne vide
  let output;
  if (compressedData.toString() === '__EMPTY_STRING__'){
    output = '';
  } else if (compressedData.toString() === '__UNDEFINED__'){
    output = undefined;
  } else if (compressedData.toString() === '__NULL__'){
    output = null;
  } else {
    output = JSON.parse(zlib.inflateSync(compressedData).toString('utf-8'));
  }
  // console.log('___output', JSON.stringify(output))
  return output;
};

// Function to process a fragment for reading
const processFragmentRead = (fragmentData) => {
  if (fragmentData?.data) {
    try {
      fragmentData.data = decompressData(fragmentData.data);
    } catch (error) {
      console.error('Error decompressing data', fragmentData.id, fragmentData.data, error);
    }
  }

  let processedFragment = new Fragment(fragmentData);

  processedFragment.id = processedFragment.id.toString();
  processedFragment.rootFrag = processedFragment?.rootFrag?.toString();
  processedFragment.branchOriginFrag = processedFragment?.branchOriginFrag?.toString();
  processedFragment.branchFrag = processedFragment?.branchFrag?.toString();
  processedFragment.originFrag = processedFragment?.originFrag?.toString();


  return processedFragment;
};

// Function to process a fragment for writing
const processFragmentWrite = (fragment) => {
  
  const processedFragment = { ...fragment };

  // console.log('___ update fragment', JSON.stringify(fragment))
  processedFragment.data = compressData(fragment.data);
  

  processedFragment.id = fragment?.id?.toString(); // Ensure id is a string
  return processedFragment;
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

const insertFragment = async (fragment) => {
  const processedFragment = processFragmentWrite(fragment);
  const query = `
    INSERT INTO fragment (id, data, originFrag, rootFrag, branchOriginFrag, branchFrag, garbageTag, garbageProcess, indexArray, maxIndexArray)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertResult = await client.execute(query, [
    processedFragment.id,
    processedFragment.data,
    processedFragment.originFrag,
    processedFragment.rootFrag,
    processedFragment.branchOriginFrag,
    processedFragment.branchFrag,
    processedFragment.garbageTag,
    processedFragment.garbageProcess,
    processedFragment.index !== undefined ? processedFragment.index : null, // Changement de index en indexArray
    processedFragment.maxIndex !== undefined ? processedFragment.maxIndex : null // Ajout de maxIndex
  ], { prepare: true });

  return processFragmentRead(processedFragment);
};

const updateFragment = async (fragment) => {
  const processedFragment = processFragmentWrite(fragment);
  const query = `
    UPDATE fragment 
    SET data = ?, originFrag = ?, rootFrag = ?, branchOriginFrag = ?, branchFrag = ?, garbageTag = ?, garbageProcess = ?, indexArray = ?, maxIndexArray = ?
    WHERE id = ?
  `;

  const updatedFields = [
    processedFragment.data,
    processedFragment.originFrag !== undefined ? processedFragment.originFrag : null,
    processedFragment.rootFrag !== undefined ? processedFragment.rootFrag : null,
    processedFragment.branchOriginFrag !== undefined ? processedFragment.branchOriginFrag : null,
    processedFragment.branchFrag !== undefined ? processedFragment.branchFrag : null,
    processedFragment.garbageTag !== undefined ? processedFragment.garbageTag : null,
    processedFragment.garbageProcess !== undefined ? processedFragment.garbageProcess : null,
    processedFragment.index !== undefined ? processedFragment.index : null,
    processedFragment.maxIndex !== undefined ? processedFragment.maxIndex : null,
    processedFragment.id
  ];

  const result = await client.execute(query, updatedFields, { prepare: true });
  return processFragmentRead(processedFragment);
};

const persistFragment = async (fragment) => {
  try {
    console.log('___persistFragment')
    const existingFragment = await getFragmentById(fragment.id);

    return await updateFragment(fragment);
  } catch (error) {
    if (error.message.includes('not found')) {
      // If the error is because the fragment was not found, insert a new one
      return await insertFragment(fragment);
    }
    // Re-throw the error if it's not the "not found" error
    throw error;
  }
};




const getFragmentById = async (id) => {
  const query = `SELECT * FROM fragment WHERE id = ?`;
  const result = await client.execute(query, [id], { prepare: true });
  if (result.rowLength > 0) {
    const fragmentData = result.rows[0];

    const resultProcessed = processFragmentRead(fragmentData); // Utilisation de processFragmentRead

    return resultProcessed;
  } else {
    throw new Error(`Fragment with ID ${id} not found`);
  }
};


// Mise à jour de searchFragmentByField
const searchFragmentByField = async (searchCriteria = {}, sortOptions = {}, selectedFields = {}, limit = Infinity, callback = null) => {
  // Traitement des critères et options
  searchCriteria = processCriteriaAndOptions(searchCriteria);
  selectedFields = processCriteriaAndOptions(selectedFields);
  // sortOptions = processCriteriaAndOptions(sortOptions); 

  const fieldNames = Object.keys(searchCriteria);

  const whereClauses = fieldNames.map(field => {
    if (Array.isArray(searchCriteria[field])) {
      return `${field} IN (${searchCriteria[field].map(() => '?').join(', ')})`;
    }
    return `${field} = ?`;
  });
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''; // Ajout conditionnel de WHERE

  const selectedFieldNames = Object.keys(selectedFields).filter(field => selectedFields[field] === 1).join(', ') || '*';
  // console.log('___selectedFieldNames', selectedFieldNames)
  const limitClause = limit !== Infinity ? `LIMIT ${limit}` : ''; // Ne pas ajouter LIMIT si limit est Infinity
  const queryString = `SELECT ${selectedFieldNames} FROM fragment ${whereClause} ${limitClause}`;
  const queryParams = fieldNames.flatMap(field => Array.isArray(searchCriteria[field]) ? searchCriteria[field] : [searchCriteria[field]]);

  const resultProcessed = await getAllFragments(queryString, queryParams, limit, callback); // Transmettre la limite

  if (!callback) {
    let rows = resultProcessed;
    if (sortOptions) {
      rows.sort((a, b) => {
        let compare;
        for (const [key, order] of Object.entries(sortOptions)) {
          const orderLower = order.toLowerCase();
          const aValue = a[key] !== undefined ? a[key] : Number.MAX_SAFE_INTEGER; // Place undefined at the end
          const bValue = b[key] !== undefined ? b[key] : Number.MAX_SAFE_INTEGER; // Place undefined at the end

          if (aValue < bValue) {
            compare = orderLower === 'asc' ? -1 : 1;
            break;
          } else if (aValue > bValue) {
            compare = orderLower === 'asc' ? 1 : -1;
            break;
          }
        }

        compare = compare || 0;
        return compare;
      });
    }
    return rows; // Utilisation de processFragmentRead
  }
  // Ne retourne rien si un callback est fourni
};

const updateMultipleFragments = async (searchCriteria, updateFields, showSpinner = false) => {
  const spinnies = new Spinnies();
  const searchCriteriaProcessed = processCriteriaAndOptions(searchCriteria); // Appel de la fonction utilitaire
  const updateFieldsProcessed = processFragmentWrite(updateFields); // Application de processFragmentWrite

  // Exclude 'id' from fields and values
  const fields = Object.keys(updateFieldsProcessed).filter(field => field !== 'id');
  const values = fields.map(field => updateFieldsProcessed[field]);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  let count = 0;

  if (showSpinner) {
    spinnies.add('update', { text: 'Updating fragments...' });
  }

  await searchFragmentByField(searchCriteriaProcessed, null, { id: 1 }, undefined, async (rows) => {
    count += rows.length;
    if (showSpinner) {
      spinnies.update('update', { text: `Updating fragments... (${count})` });
    }

    const idsToUpdate = rows.map(fragment => fragment.id);
    const whereClause = `id IN (${idsToUpdate.map(() => '?').join(', ')})`;
    const query = `UPDATE fragment SET ${setClause} WHERE ${whereClause}`;
    const queryValues = [...values, ...idsToUpdate];
    await client.execute(query, queryValues, { prepare: true });

  });

  if (showSpinner) {
    spinnies.succeed('update', { text: 'Fragments updated successfully!' });
  }
};

const deleteManyFragments = async (searchCriteria, showSpinner = false) => {
  searchCriteria = processCriteriaAndOptions(searchCriteria);
  let count = 0;
  if (showSpinner) {
    spinnies.add('delete', { text: 'Deleting fragments...' });
  }
  await searchFragmentByField(searchCriteria, undefined, { id: 1 }, undefined, async (rows) => {
    count += rows.length;
    if (showSpinner) {
      spinnies.update('delete', { text: `Deleting fragments... (${count})` });
    }
    const batchIds = rows.map(fragment => fragment.id);
    const whereClause = `id IN (${batchIds.map(() => '?').join(', ')})`;
    const query = `DELETE FROM fragment WHERE ${whereClause}`;
    await client.execute(query, batchIds, { prepare: true });
  });

  if (showSpinner) {
    spinnies.succeed('delete', { text: 'Fragments deleted successfully!' });
  }
};

const countDocuments = async (searchCriteria) => {
  let count = 0;
  await searchFragmentByField(searchCriteria, undefined, { id: 1 }, undefined, async (rows) => {
    count = rows.length;
  });
  return count; // Retourne le nombre d'IDs trouvés
};

const getAllFragments = async (query, params, limit = Infinity, callback = null) => {
  let allRows = [];
  let pageCount = 0;
  let result;
  const pageSize = 100; // Maximum page size

  do {
    pageCount++;
    result = await client.execute(query, params, { 
      prepare: true, 
      pageState: result?.pageState,
      fetchSize: pageSize // Add page size limit
    });

    if (callback) {
      const processedRows = result.rows.map(row => processFragmentRead(row));
      await callback(processedRows);
    } else {
      allRows = allRows.concat(result.rows);
    }

    if (limit !== Infinity && allRows.length >= limit) {
      allRows = allRows.slice(0, limit);
      break;
    }
  } while (result.pageState);

  if (!callback) {
    return allRows.map(row => processFragmentRead(row));
  }
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
  countDocuments,
  getAllFragments,
  model: Fragment
};
