const client = require('../db/scylla_client');
const zlib = require('zlib');
const Fragment = require('../model_schemas/fragments_schema_scylla');
const { validate: uuidValidate } = require('uuid');
const Spinnies = require('spinnies');

// Helper function to compress data
const compressData = (data) => {
  if (!data) return null;
  return zlib.deflateSync(Buffer.from(JSON.stringify(data), 'utf-8'));
};

// Helper function to decompress data
const decompressData = (compressedData) => {
  if (!compressedData) return null;
  return JSON.parse(zlib.inflateSync(compressedData).toString('utf-8'));
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

  if (fragment?.data) {
    processedFragment.data = compressData(fragment.data);
  }

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

  if(processedFragment.index==0){
    console.log('___processedFragment', processedFragment)
  }
  const updatedFields = [
    processedFragment.data!=undefined ? processedFragment.data : null,
    processedFragment.originFrag !== undefined ? processedFragment.originFrag : null,
    processedFragment.rootFrag !== undefined ? processedFragment.rootFrag : null,
    processedFragment.branchOriginFrag !== undefined ? processedFragment.branchOriginFrag : null,
    processedFragment.branchFrag !== undefined ? processedFragment.branchFrag : null,
    processedFragment.garbageTag !== undefined ? processedFragment.garbageTag : null,
    processedFragment.garbageProcess !== undefined ? processedFragment.garbageProcess : null,
    processedFragment.index !== undefined ? processedFragment.index : null, // Changement de index en indexArray
    processedFragment.maxIndex !== undefined ? processedFragment.maxIndex : null, // Ajout de maxIndex
    processedFragment.id
  ];
  if(processedFragment.index==0){
    console.log('___updatedFields', updatedFields);
  }

  const result = await client.execute(query, updatedFields, { prepare: true });
  return processFragmentRead(processedFragment);
};

const persistFragment = async (fragment) => {
  try {

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

          if (aValue < bValue){
            compare = orderLower === 'asc' ? -1 : 1 ;
            break;
          } else if (aValue > bValue){
            compare = orderLower === 'asc' ? 1 : -1;
            break;
          }
        }
        
        compare=compare||0;
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

  // Récupérer les fragments à mettre à jour
  const fragmentsToUpdate = await searchFragmentByField(searchCriteriaProcessed, null, { id: 1 });
  // console.log('fragmentsToUpdate', fragmentsToUpdate)
  const idsToUpdate = fragmentsToUpdate.map(fragment => fragment.id);

  // console.log('idsToUpdate', idsToUpdate)

  if (idsToUpdate.length === 0) return; 

  // Diviser les IDs en lots de 100
  const batchSize = 100;

  if (showSpinner) {
    spinnies.add('update', { text: 'Updating fragments...' });
  }

  for (let i = 0; i < idsToUpdate.length; i += batchSize) {
    const batchIds = idsToUpdate.slice(i, i + batchSize);
    const whereClause = `id IN (${batchIds.map(() => '?').join(', ')})`;
    const query = `UPDATE fragment SET ${setClause} WHERE ${whereClause}`;
    const queryValues = [...values, ...batchIds];

    // Exécuter chaque mise à jour de lot une par une
    const result = await client.execute(query, queryValues, { prepare: true });

    // Mettre à jour le spinner avec la progression
    if (showSpinner) {
      spinnies.update('update', { text: `Updating fragments... (${Math.min(i + batchSize, idsToUpdate.length)}/${idsToUpdate.length})` });
    }
  }

  if (showSpinner) {
    spinnies.succeed('update', { text: 'Fragments updated successfully!' });
  }
};

const deleteManyFragments = async (searchCriteria) => {
  searchCriteria = processCriteriaAndOptions(searchCriteria);
  const itemsToDelete = await searchFragmentByField(searchCriteria, undefined, { id: 1 });
  const idsToDelete = itemsToDelete.map(fragment => fragment.id);
  if (idsToDelete.length === 0) return; 

  // Diviser les IDs en lots de 100
  const batchSize = 100;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batchIds = idsToDelete.slice(i, i + batchSize);
    const whereClause = `id IN (${batchIds.map(() => '?').join(', ')})`;
    const query = `DELETE FROM fragment WHERE ${whereClause}`;
    await client.execute(query, batchIds, { prepare: true }); // Exécuter chaque suppression de lot une par une
  }

};

const countDocuments = async (searchCriteria) => {
  const ids = await searchFragmentByField(searchCriteria, undefined, { id: 1 }); // Sélectionne uniquement les IDs
  return ids.length; // Retourne le nombre d'IDs trouvés
};

const getAllFragments = async (query, params, limit = Infinity, callback = null) => {
  let allRows = [];
  let pageCount = 0; // Initialisation du compteur de pages
  let result;

  do {
    pageCount++; // Incrémentation du compteur de pages
    result = await client.execute(query, params, { prepare: true, pageState: result?.pageState });

    if (callback) {
      const processedRows = result.rows.map(row => processFragmentRead(row));
      await callback(processedRows); // Appeler le callback avec tous les rows de la page
    } else {
      allRows = allRows.concat(result.rows);
    }

    // Arrêter la pagination si la limite est atteinte, sauf si la limite est Infinity
    if (limit !== Infinity && allRows.length >= limit) {
      allRows = allRows.slice(0, limit); // S'assurer que le nombre de lignes ne dépasse pas la limite
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
