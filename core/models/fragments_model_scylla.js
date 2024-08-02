const client = require('../db/scylla_client');
const zlib = require('zlib');
const Fragment = require('../model_schemas/fragments_schema_scylla');

const insertFragment = async (fragment) => {
  const query = `
    INSERT INTO fragment (id, data, originFrag, rootFrag, branchOriginFrag, branchFrag, garbageTag, garbageProcess)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  let compressedJsonData;
  if(fragment?.data){
    compressedJsonData = zlib.deflateSync(Buffer.from(JSON.stringify(fragment.data), 'utf-8'));
  }

  // console.log('____insertFragment',fragment);

  await client.execute(query, [
    fragment.id,
    compressedJsonData,
    fragment.originFrag,
    fragment.rootFrag,
    fragment.branchOriginFrag,
    fragment.branchFrag,
    fragment.garbageTag,
    fragment.garbageProcess
  ], { prepare: true });
  
  const test = await getFragmentById(fragment.id);
  // console.log('____check insertFragment',test);


  // console.log(`Fragment with ID ${fragment.id} inserted successfully`);
  return new Fragment({ // Retourne le fragment inséré
    id: fragment.id,
    data: fragment.data,
    originFrag: fragment.originFrag,
    rootFrag: fragment.rootFrag,
    branchOriginFrag: fragment.branchOriginFrag,
    branchFrag: fragment.branchFrag,
    garbageTag: fragment.garbageTag,
    garbageProcess: fragment.garbageProcess
  });
};

const updateFragment = async (fragment) => {
  const query = `
    UPDATE fragment 
    SET data = ?, originFrag = ?, rootFrag = ?, branchOriginFrag = ?, branchFrag = ?, garbageTag = ?, garbageProcess = ?
    WHERE id = ?
  `;

  let compressedJsonData;
  if(fragment?.data){
    compressedJsonData = zlib.deflateSync(Buffer.from(JSON.stringify(fragment.data), 'utf-8'));
  } else {
    compressedJsonData = null; // Écraser avec null si data est undefined
  }

  // Vérification des champs undefined et écrasement
  const updatedFields = [
    compressedJsonData,
    fragment.originFrag !== undefined ? fragment.originFrag : null,
    fragment.rootFrag !== undefined ? fragment.rootFrag : null,
    fragment.branchOriginFrag !== undefined ? fragment.branchOriginFrag : null,
    fragment.branchFrag !== undefined ? fragment.branchFrag : null,
    fragment.garbageTag !== undefined ? fragment.garbageTag : null,
    fragment.garbageProcess !== undefined ? fragment.garbageProcess : null,
    fragment.id
  ];

  await client.execute(query, updatedFields, { prepare: true });

  // console.log(`Fragment with ID ${fragment.id} updated successfully`);

  const test = await getFragmentById(fragment.id);
  // console.log('____check updateFragment',test);


  return new Fragment({ // Retourne le fragment mis à jour
    id: fragment.id,
    data: fragment.data,
    originFrag: fragment.originFrag,
    rootFrag: fragment.rootFrag,
    branchOriginFrag: fragment.branchOriginFrag,
    branchFrag: fragment.branchFrag,
    garbageTag: fragment.garbageTag,
    garbageProcess: fragment.garbageProcess
  });
};

const persistFragment = async (fragment) => {
  const checkQuery = `SELECT id FROM fragment WHERE id = ?`;
  const result = await client.execute(checkQuery, [fragment.id], { prepare: true });

  if (result.rowLength > 0) {
    // Si le fragment existe, on le met à jour
    return await updateFragment(fragment); // Retourne le fragment mis à jour
  } else {
    // Sinon, on l'insère
    return await insertFragment(fragment); // Retourne le fragment inséré
  }
};

const getFragmentById = async (id) => {
  const query = `SELECT * FROM fragment WHERE id = ?`;
  const result = await client.execute(query, [id], { prepare: true });

  if (result.rowLength > 0) {
    const fragmentData = result.rows[0];
    // Décompression des données
    if(fragmentData?.data){
      fragmentData.data = JSON.parse(zlib.inflateSync(fragmentData.data).toString('utf-8'));
    }
    // console.log('____getFragmentById-1',fragmentData);
    fragmentData.id = fragmentData.id.toString();
    // Création d'une instance de Fragment
    const fragment = new Fragment(fragmentData);
    // console.log('____getFragmentById-2',fragment);
    return fragment;
  } else {
    throw new Error(`Fragment with ID ${id} not found`);
  }
};

const processRows = (queryString) => {
  let accumulatedRows = [];
  return new Promise((resolve) => {
    client.eachRow(queryString, [], { autoPage: true }, function (n, row) {
      row.data = JSON.parse(zlib.inflateSync(row.data).toString('utf-8'));
      // return new Fragment(row);
      accumulatedRows.push(new Fragment(row));
      // Cette fonction sera invoquée pour chaque ligne de la table
    }, function() {
      // console.log('____searchFragmentByField END:', accumulatedRows.length);
      resolve(accumulatedRows); // Résoudre la promesse une fois toutes les lignes traitées
    });
  });
};

const searchFragmentByField = async (fragment) => {
  const fields = Object.keys(fragment);
  const values = Object.values(fragment);
  
  // Log de la requête sous forme de chaîne
  const queryString = `SELECT * FROM fragment WHERE ${fields.map((field, index) => `${field} = ${values[index]}`).join(' AND ')}`;
  // const countString = `SELECT COUNT(*) FROM fragment WHERE ${fields.map((field, index) => `${field} = ${values[index]}`).join(' AND ')}`;
  // console.log('____searchFragmentByField query string:', queryString);
  // console.log('____searchFragmentByField countString:', countString);
    // let result = await client.execute(queryString);
  // const countResult = await client.execute(countString);

  // console.log('____searchFragmentByField countResult:', countResult.rows);

  const results = await processRows(queryString);

  // console.log('____searchFragmentByField results:', results.length);

  return results;
};

const updateMultipleFragments = async (searchCriteria, updateFields) => {
  const fields = Object.keys(updateFields);
  const values = Object.values(updateFields);

  // console.log('updateMultipleFragments',searchCriteria,updateFields)
  
  // Construction de la requête de mise à jour
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const whereClause = Object.keys(searchCriteria).map(field => `${field} = ?`).join(' AND ');
  // console.log('updateMultipleFragments',searchCriteria,updateFields)
  // console.log('updateMultipleFragments',whereClause)
  const query = `UPDATE fragment SET ${setClause} WHERE ${whereClause}`;
  
  // Rassemblement des valeurs pour la requête
  const queryValues = [...values, ...Object.values(searchCriteria)];
  
  await client.execute(query, queryValues, { prepare: true });
  
  console.log(`Fragments updated successfully based on criteria: ${JSON.stringify(searchCriteria)}`);
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
