'use strict';
const client = require('../db/scylla_client');
const File = require('../model_schemas/file_schema_scylla');
const { v4: uuidv4 } = require('uuid');

const insertFile = async (file) => {
  const query = `
    INSERT INTO file (id, binary, frag, filename, processId, cacheId)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const insertResult = await client.execute(query, [
    file.id,
    file.binary,
    file.frag,
    file.filename,
    file.processId, 
    file.cacheId 
  ], { prepare: true });

  return file;
};

const deleteFileById = async (id) => {
  const query = `DELETE FROM file WHERE id = ?`;
  await client.execute(query, [id], { prepare: true });
};

const getFileById = async (id) => {
  const query = `SELECT * FROM file WHERE id = ?`;
  const result = await client.execute(query, [id], { prepare: true });

  if (result.rowLength > 0) {
    const fileData = result.rows[0];
    return new File(fileData);
  } else {
    throw new Error(`File with ID ${id} not found`);
  }
};

const searchFileByField = async (searchCriteria = {}, sortOptions = {}, selectedFields = {}) => {
  const fieldNames = Object.keys(searchCriteria);
  
  const whereClauses = fieldNames.map(field => {
    if (Array.isArray(searchCriteria[field])) {
      return `${field} IN (${searchCriteria[field].map(() => '?').join(', ')})`;
    }else{
      return `${field} = ?`;
    }
  });
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const selectedFieldNames = Object.keys(selectedFields).filter(field => selectedFields[field] === 1).join(', ') || '*';
  let queryString = `SELECT ${selectedFieldNames} FROM file ${whereClause}`;
  
  // Ajouter ALLOW FILTERING si nous utilisons IN dans la clause WHERE
  if (whereClauses.some(clause => clause.includes('IN'))) {
    queryString += ' ALLOW FILTERING';
  }
  
  const queryParams = fieldNames.flatMap(field => Array.isArray(searchCriteria[field]) ? searchCriteria[field] : [searchCriteria[field]]);
  const result = await getAllFiles(queryString, queryParams);

  let rows = result;
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

  return rows.map(row => new File(row));
};

const getAllFiles = async (query, params) => {
  let result = await client.execute(query, params, { prepare: true });
  let allRows = result.rows;

  while (result.pageState) {
    result = await client.execute(query, params, { prepare: true, pageState: result.pageState });
    allRows = allRows.concat(result.rows);
  }

  return allRows;
};

const updateFile = async (file) => {
  const query = `
    UPDATE file 
    SET binary = ?, filename = ?, processId = ?, cacheId = ?
    WHERE id = ?
  `;

  const updatedFields = [
    file.binary !== undefined ? file.binary : null,
    file.filename !== undefined ? file.filename : null,
    file.processId !== undefined ? file.processId : null,
    file.cacheId !== undefined ? file.cacheId : null,
    file.id
  ];

  await client.execute(query, updatedFields, { prepare: true });

  return file;
};

const duplicateFile = async (existingFile, newFileProperties) => {
  // Créer un nouvel objet File en combinant les propriétés de l'ancien fichier et les nouvelles propriétés
  const newFileData = {
    ...existingFile,
    ...newFileProperties,
    id: undefined // Laisser le constructeur générer un nouvel ID
  };
  
  const newFile = new File(newFileData);

  // Persister le nouveau fichier dans la base de données
  await insertFile(newFile);

  return newFile;
};

const deleteManyFile = async (criteria) => {
  // console.log('start deleteManyFile : ',criteria)

  const filesToDelete = await searchFileByField(criteria);
  
  const fileIds = filesToDelete.map(file => file.id);

  // console.log('deleteManyFile : ',fileIds)

  const query = `DELETE FROM file WHERE id IN (${fileIds.map(() => '?').join(', ')})`;

  await client.execute(query, fileIds, { prepare: true });
  
};

module.exports = {
  insertFile,
  deleteFileById,
  getFileById,
  searchFileByField,
  find: searchFileByField,
  updateFile,
  duplicateFile,
  deleteManyFile,
  model: File
};
