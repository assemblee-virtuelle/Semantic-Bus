const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const dynamoDBClientsPromise = require('../db/dynamodb_client');
const Fragment = require('../model_schemas/fragments_schema_scylla');
const zlib = require('zlib');

const TABLE_NAME = 'fragment';

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

// Function to process a fragment
const processFragment = (fragmentData) => {
  if (fragmentData?.data) {
    fragmentData.data = decompressData(fragmentData.data);
  }
  fragmentData.id = fragmentData.id.toString(); // Convert id to string
  return new Fragment(fragmentData);
};

// Function to insert a new fragment
const insertFragment = async (fragment) => {
  const { docClient } = await dynamoDBClientsPromise;
  const compressedData = compressData(fragment.data);
  
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: fragment.id.toString() || uuidv4(),
      data: compressedData,
      originFrag: fragment.originFrag?.toString() || null,
      rootFrag: fragment.rootFrag?.toString() || null,
      branchOriginFrag: fragment.branchOriginFrag?.toString() || null,
      branchFrag: fragment.branchFrag?.toString() || null,
      garbageTag: fragment.garbageTag || false,
      garbageProcess: fragment.garbageProcess || null,
      indexArray: fragment.index || null,
      maxIndexArray: fragment.maxIndex || null
    }
  };

  await docClient.put(params).promise();
  return fragment;
};

// Function to persist a fragment
const persistFragment = async (fragment) => {
  const { docClient } = await dynamoDBClientsPromise;
  
  // Check if fragment exists
  let existingFragment;
  try {
    existingFragment = await getFragmentById(fragment.id.toString());
  } catch (error) {
    existingFragment = null;      
  }

  // If fragment exists, update it, otherwise insert a new one
  if (existingFragment) {
    return await updateFragment(fragment);
  } else {
    return await insertFragment(fragment);
  }
};

// Function to get a fragment by ID
const getFragmentById = async (id) => {
  const { docClient } = await dynamoDBClientsPromise;
  // console.log('_id', id);
  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };
  // console.log('params', params);
  const result = await docClient.get(params).promise();

  if (!result.Item) {
    throw new Error(`Fragment with ID ${id} not found`);
  } else {
    // console.log('result', result);
  }

  return processFragment(result.Item); // Use processFragment here
};

// Function to update a fragment
const updateFragment = async (fragment) => {
  const { docClient } = await dynamoDBClientsPromise;
  const compressedData = compressData(fragment.data);
  
  const params = {
    TableName: TABLE_NAME,
    Key: { id: fragment.id.toString() },
    UpdateExpression: 'SET #data = :data, originFrag = :originFrag, rootFrag = :rootFrag, ' +
      'branchOriginFrag = :branchOriginFrag, branchFrag = :branchFrag, ' +
      'garbageTag = :garbageTag, garbageProcess = :garbageProcess, ' +
      'indexArray = :indexArray, maxIndexArray = :maxIndexArray',
    ExpressionAttributeNames: {
      '#data': 'data'
    },
    ExpressionAttributeValues: {
      ':data': compressedData,
      ':originFrag': fragment.originFrag?.toString() || null,
      ':rootFrag': fragment.rootFrag?.toString() || null,
      ':branchOriginFrag': fragment.branchOriginFrag?.toString() || null,
      ':branchFrag': fragment.branchFrag?.toString() || null,
      ':garbageTag': fragment.garbageTag || false,
      ':garbageProcess': fragment.garbageProcess || null,
      ':indexArray': fragment.index || null,
      ':maxIndexArray': fragment.maxIndex || null
    }
  };

  await docClient.update(params).promise();
  return fragment;
};

// Utility function to process criteria and options
const processCriteriaAndOptions = (criteria) => {
  if (criteria?.index) {
    criteria.indexArray = criteria.index;
    delete criteria.index;
  }
  if (criteria?.maxIndex) {
    criteria.maxIndexArray = criteria.maxIndex;
    delete criteria.maxIndex;
  }
  return criteria;
};

// Update searchFragmentByField
const searchFragmentByField = async (searchCriteria = {}, sortOptions = {}, selectedFields = {}) => {
  const { docClient } = await dynamoDBClientsPromise;
  searchCriteria = processCriteriaAndOptions(searchCriteria);

  let KeyConditionExpression = [];
  let FilterExpression = [];
  let ExpressionAttributeValues = {};
  let ExpressionAttributeNames = {};

  // Assuming 'id' is the partition key, adjust as necessary
  if (searchCriteria.id) {
    KeyConditionExpression.push('#id = :id');
    ExpressionAttributeNames['#id'] = 'id';
    ExpressionAttributeValues[':id'] = searchCriteria.id;
    delete searchCriteria.id;
  }

  Object.entries(searchCriteria).forEach(([key, value], index) => {
    const attributeName = `#attr${index}`;
    const attributeValue = `:val${index}`;
    
    ExpressionAttributeNames[attributeName] = key;
    ExpressionAttributeValues[attributeValue] = value;
    
    if (Array.isArray(value)) {
      FilterExpression.push(`${attributeName} IN (${value.map((_, i) => `${attributeValue}${i}`).join(', ')})`);
      value.forEach((val, i) => {
        ExpressionAttributeValues[`${attributeValue}${i}`] = val;
      });
    } else {
      FilterExpression.push(`${attributeName} = ${attributeValue}`);
    }
  });

  // Ensure KeyConditionExpression is defined
  if (KeyConditionExpression.length === 0) {
    throw new Error("Query must have one of KeyConditions or KeyConditionExpression");
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: KeyConditionExpression.join(' AND '),
    FilterExpression: FilterExpression.length > 0 ? FilterExpression.join(' AND ') : undefined,
    ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length > 0 ? ExpressionAttributeNames : undefined,
    ExpressionAttributeValues: Object.keys(ExpressionAttributeValues).length > 0 ? ExpressionAttributeValues : undefined,
    ProjectionExpression: Object.keys(selectedFields).length > 0 ? Object.keys(selectedFields).join(', ') : undefined
  };

  const items = [];
  let lastEvaluatedKey = undefined;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    
    const result = await docClient.query(params).promise();
    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  // Process and sort results
  let processedItems = items.map(item => processFragment(item));

  if (sortOptions) {
    processedItems.sort((a, b) => {
      for (const [key, order] of Object.entries(sortOptions)) {
        const orderLower = order.toLowerCase();
        if (a[key] < b[key]) return orderLower === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return orderLower === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  return processedItems;
};

const updateMultipleFragments = async (searchCriteria, updateFields) => {
  const fragments = await searchFragmentByField(searchCriteria);
  
  const updatePromises = fragments.map(fragment => {
    const updatedFragment = { ...fragment, ...updateFields };
    return updateFragment(updatedFragment);
  });

  await Promise.all(updatePromises);
};

const deleteManyFragments = async (searchCriteria) => {
  const fragments = await searchFragmentByField(searchCriteria);
  
  const deletePromises = fragments.map(fragment => {
    const params = {
      TableName: TABLE_NAME,
      Key: { id: fragment.id }
    };
    return docClient.delete(params).promise();
  });

  await Promise.all(deletePromises);
};

const countDocuments = async (searchCriteria) => {
  const fragments = await searchFragmentByField(searchCriteria, undefined, { id: 1 });
  return fragments.length;
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
  model: Fragment
}; 