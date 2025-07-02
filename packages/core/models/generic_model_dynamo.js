const { v4: uuidv4 } = require('uuid');
const dynamoDBClientsPromise = require('../db/dynamodb_client');
const zlib = require('zlib');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { TransactWriteItemsCommand} = require("@aws-sdk/client-dynamodb");
const Spinnies = require('spinnies');

class FragmentModel {
  /**
   * Constructs a new FragmentModel instance.
   * 
   * @param {string} tableName - The name of the DynamoDB table.
   * @param {Array<Object>} fields - An array of field definitions.
   * @param {Function} model - The model constructor function.
   */
  constructor(tableName, fields, model) {
    this.tableName = tableName;
    this.fields = fields;
    this.model = model;
  }

  // Helper function to compress data
  compressData(data) {
    if (!data) return null;
    return zlib.deflateSync(Buffer.from(JSON.stringify(data), 'utf-8'));
  }

  // Helper function to decompress data
  decompressData(compressedData) {
    if (!compressedData) return null;
    return JSON.parse(zlib.inflateSync(compressedData).toString('utf-8'));
  }

  // Function to process a fragment
  processFragmentRead(fragmentData) {
    Object.keys(fragmentData).forEach((name) => {
      const field = this.fields.find(f => f.name === name);
      if (!field) return;

      const { isCompressed, requiresToString } = field;

      if (isCompressed && fragmentData[name]) {
        try {
          // fragmentData[name] = this.decompressData(fragmentData[name]);
        } catch (error) {
          console.error('Error decompressing data', fragmentData.id, error.message);
        }
      }
      if (requiresToString && fragmentData[name]) {
        fragmentData[name] = fragmentData[name].toString();
      }
    });
    return new this.model(fragmentData);
  }

  // Private method to prepare data for database operations
  processFragmentWrite(fragment) {
    const item = {};

    Object.keys(fragment).forEach((name) => {
      const field = this.fields.find(f => f.name === name);
      if (!field) return;

      let value = fragment[name];
      const { defaultValue, isCompressed, requiresToString } = field;

      // Convert boolean to numeric
      if (typeof value === 'boolean') {
        value = value ? 1 : 0;
      }

      if (value === null || value === undefined) {
        return; // Skip if value is null or undefined
      }

      if (isCompressed) {
        item[name] = value;
      } else {
        item[name] = requiresToString ? value.toString() : (value ?? defaultValue ?? null);
      }
    });

    item[this.fields.find(f => f.name === 'id').name] = fragment.id?.toString() || uuidv4();
    return item;
  }

  // Function to insert a new fragment
  async insertFragment(fragment) {
    const { docClient } = await dynamoDBClientsPromise;
    const item = this.processFragmentWrite(fragment);

    const params = {
      TableName: this.tableName,
      Item: item
    };

    await docClient.send(new PutCommand(params));
    return fragment;
  }

  // Function to persist a fragment
  async persistFragment(fragment) {
    try {
      const existingFragment = await this.getFragmentById(fragment[this.fields.find(f => f.name === 'id').name].toString());
      return await this.updateFragment(fragment);
    } catch (error) {
      if (error.message.includes('not found')) {
        // If the error is because the fragment was not found, insert it
        return await this.insertFragment(fragment);
      } else {
        // Re-throw the error if it's not the "not found" error
        throw error;
      }
    }
  }

  // Function to get a fragment by ID
  async getFragmentById(id) {
    const { docClient } = await dynamoDBClientsPromise;
    const params = {
      TableName: this.tableName,
      Key: { 'id': id }
    };

    // Utilisation de GetCommand pour AWS SDK v3
    const result = await docClient.send(new GetCommand(params));

    if (!result.Item) {
      throw new Error(`Fragment with ID ${id} not found`);
    }

    return this.processFragmentRead(result.Item);
  }

  // Utility function to create update expressions
  createUpdateExpressions(updateFields) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(updateFields).forEach(([name, value]) => {
      const placeholder = `#${name}`;
      const valuePlaceholder = `:${name}`;
      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = name;
      expressionAttributeValues[valuePlaceholder] = value;


      // if (typeof value === 'string') {
      //   expressionAttributeValues[valuePlaceholder] = value;
      // } else if (typeof value === 'number') {
      //   expressionAttributeValues[valuePlaceholder] = value;
      // } else if (typeof value === 'boolean') {
      //   expressionAttributeValues[valuePlaceholder] = value;
      // } else if (Array.isArray(value)) {
      //   expressionAttributeValues[valuePlaceholder] = value.map(v => v.toString());
      // } else if (value === null) {
      //   expressionAttributeValues[valuePlaceholder] = { NULL: true };
      // } else {
      //   throw new Error(`Unsupported type for attribute value: ${typeof value}`);
      // }
    });

    return {
      updateExpressions: updateExpressions.join(', '),
      expressionAttributeNames,
      expressionAttributeValues
    };
  }

  // Function to update a fragment
  async updateFragment(fragment) {
    const { docClient } = await dynamoDBClientsPromise;
    const item = this.processFragmentWrite(fragment);

    // Remove the 'id' field from the update fields
    delete item[this.fields.find(f => f.name === 'id').name];

    const { updateExpressions, expressionAttributeNames, expressionAttributeValues } = this.createUpdateExpressions(item);

    const params = {
      TableName: this.tableName,
      Key: { [this.fields.find(f => f.name === 'id').name]: fragment[this.fields.find(f => f.name === 'id').name].toString() },
      UpdateExpression: `SET ${updateExpressions}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    };

    await docClient.send(new UpdateCommand(params));
    return fragment;
  }

  // Utility function to process criteria and options
  processCriteriaAndOptions(criteria) {
    if (criteria?.[this.fields.find(f => f.name === 'index')?.name]) {
      criteria[this.fields.find(f => f.name === 'indexArray').name] = criteria[this.fields.find(f => f.name === 'index').name];
      delete criteria[this.fields.find(f => f.name === 'index')?.name];
    }
    if (criteria?.[this.fields.find(f => f.name === 'maxIndex')?.name]) {
      criteria[this.fields.find(f => f.name === 'maxIndexArray')?.name] = criteria[this.fields.find(f => f.name === 'maxIndex')?.name];
      delete criteria[this.fields.find(f => f.name === 'maxIndex').name];
    }
    return criteria;
  }

  // Update searchFragmentByField
  async searchFragmentByField(searchCriteria = {}, sortOptions = {}, selectedFields = {}, limit = Infinity, callback = null) {
    const { docClient } = await dynamoDBClientsPromise;
    searchCriteria = this.processCriteriaAndOptions(searchCriteria);
    let items = [];
    const batchSizeDefault = Infinity;
    
    if (Object.keys(searchCriteria).length === 0) {
      const params = {
        TableName: this.tableName,
        ProjectionExpression: Object.keys(selectedFields).length > 0 ? Object.keys(selectedFields).join(', ') : undefined,
      };

      let lastEvaluatedKey = undefined;
      let itemCount = 0;

      do {
        let batchSize = Math.min(limit === Infinity ? batchSizeDefault : limit, batchSizeDefault);

        batchSize = itemCount + batchSize > limit ? limit - itemCount : batchSize;
        // console.log('batchSize : ', batchSize);
        if (batchSize !== Infinity) {
          params.Limit = batchSize;
        }
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        // console.log('scan command : ', params);

        const result = await docClient.send(new ScanCommand(params));
        if (callback) {
          await callback(result.Items.map(item => this.processFragmentRead(item)));
        } else {
          items = items.concat(result.Items.map(item => this.processFragmentRead(item)));
        }
        itemCount += result.Items.length;
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey && (limit === null || itemCount < limit));

      if (!callback) {
        if (sortOptions) {
          items.sort((a, b) => {
            for (const [key, order] of Object.entries(sortOptions)) {
              const orderLower = order.toLowerCase();
              if (a[key] < b[key]) return orderLower === 'asc' ? -1 : 1;
              if (a[key] > b[key]) return orderLower === 'asc' ? 1 : -1;
            }
            return 0;
          });
        }

        return items;
      }
    }
    else {

      let KeyConditionExpression = [];
      let FilterExpression = [];
      let ExpressionAttributeValues = {};
      let ExpressionAttributeNames = {};
      let IndexName = null;

      // Utility function to handle expressions
      const addExpression = (name, value, isKeyCondition = false) => {
        const attributeName = `#${name}`;
        const attributeValue = `:${name}`;

        // Convert boolean to numeric
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        }

        ExpressionAttributeNames[attributeName] = name;
        ExpressionAttributeValues[attributeValue] = value;

        if (isKeyCondition) {
          KeyConditionExpression.push(`${attributeName} = ${attributeValue}`);
        } else {
          if (Array.isArray(value)) {
            FilterExpression.push(`${attributeName} IN (${value.map((_, i) => `${attributeValue}${i}`).join(', ')})`);
            value.forEach((val, i) => {
              ExpressionAttributeValues[`${attributeValue}${i}`] = val;
            });
          } else {
            FilterExpression.push(`${attributeName} = ${attributeValue}`);
          }
        }
      };

      // Handle indexed fields for KeyConditionExpression
      this.fields.forEach(({ name, isIndexed, indexName }) => {
        if (isIndexed && searchCriteria[name]) {
          addExpression(name, searchCriteria[name], true);
          delete searchCriteria[name];
          // console.log('field', name, isIndexed,indexName);
          if (indexName) {
            IndexName = indexName;
          }
        }
      });

      // Ensure there is at least one KeyConditionExpression
      if (KeyConditionExpression.length === 0) {
        throw new Error("Query must have a KeyConditionExpression");
      }

      // Handle remaining search criteria for FilterExpression
      Object.entries(searchCriteria).forEach(([key, value]) => {
        addExpression(key, value);
      });
      const params = {
        TableName: this.tableName,
        KeyConditionExpression: KeyConditionExpression.join(' AND '),
        FilterExpression: FilterExpression.length > 0 ? FilterExpression.join(' AND ') : undefined,
        ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length > 0 ? ExpressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(ExpressionAttributeValues).length > 0 ? ExpressionAttributeValues : undefined,
        ProjectionExpression: Object.keys(selectedFields).length > 0 ? Object.keys(selectedFields).join(', ') : undefined,
        IndexName: IndexName,
        Limit: limit === Infinity ? undefined : limit
      };

      let lastEvaluatedKey = undefined;
      let itemCount = 0;

      do {
        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }
        // console.log('params : ', params);

        const result = await docClient.send(new QueryCommand(params));
        // const batchItems = result.Items.map(item => this.processFragmentRead(item));
        const batchItems = result.Items;  

        if (callback) {
          await callback(batchItems); // Call the callback with a batch of items
        } else {
          items = items.concat(batchItems);
        }

        itemCount += result.Items.length;
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey && (limit === null || itemCount < limit));

      if (!callback) {
        let processedItems = items.map(item => this.processFragmentRead(item));

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
      }
    }
  }

  async updateMultipleFragments(searchCriteria, updateFields, logProgress = false) {
    const { docClient } = await dynamoDBClientsPromise;
    let processedCount = 0;
    const spinnies = new Spinnies();

    if (logProgress) {
        spinnies.add('spinner1', { text: 'multi update' });
    }

    // Limit the fields to only 'id' since it's needed for the update
    const selectedFields = { id: true };

    await this.searchFragmentByField(searchCriteria, undefined, selectedFields, Infinity, async (items) => {
        // Appel de updateFragment pour chaque élément en parallèle
        // console.log('items : ', items.length);
        await Promise.all(items.map(async (item) => {
            try {
                await this.updateFragment({ ...item, ...updateFields });
            } catch (err) {
                console.error("Error updating fragment: ", err);
            }
        }));

        processedCount += items.length;
        if (logProgress) {
            spinnies.update('spinner1', { text: `multi update (${processedCount} processed)` });
        }
    });

    if (logProgress) {
        spinnies.succeed('spinner1', { text: `multi update Done! Total processed: ${processedCount}` });
    }
  }

  async deleteManyFragments(searchCriteria, logProgress = false) {
    const { docClient } = await dynamoDBClientsPromise;
    let processedCount = 0;
    const spinnies = new Spinnies();

    if (logProgress) {
        spinnies.add('deleteSpinner', { text: 'Deleting fragments...' });
    }

    // Limit the fields to only 'id' since it's needed for the delete
    const selectedFields = { id: true };

    await this.searchFragmentByField(searchCriteria, undefined, selectedFields, Infinity, async (items) => {
        // Delete each item in parallel
        await Promise.all(items.map(async (item) => {
            try {
                const params = {
                    TableName: this.tableName,
                    Key: { 'id': item.id }
                };
                await docClient.send(new DeleteCommand(params));
            } catch (err) {
                console.error("Error deleting fragment: ", err);
            }
        }));

        processedCount += items.length;
        if (logProgress) {
            spinnies.update('deleteSpinner', { text: `Deleting fragments... (${processedCount} processed)` });
        }
    });

    if (logProgress) {
        spinnies.succeed('deleteSpinner', { text: `Deleting fragments... Done! Total processed: ${processedCount}` });
    }
  }

  async countDocuments(searchCriteria = {}) {
    const { docClient } = await dynamoDBClientsPromise;
    searchCriteria = this.processCriteriaAndOptions(searchCriteria);

    const params = {
      TableName: this.tableName,
      Select: "COUNT"
    };

    let KeyConditionExpression = [];
    let FilterExpression = [];
    let ExpressionAttributeNames = {};
    let ExpressionAttributeValues = {};
    let IndexName = null;

    // Utility function to handle expressions
    const addExpression = (name, value, isKeyCondition = false) => {
      const attributeName = `#${name}`;
      const attributeValue = `:${name}`;

      // Convert boolean to numeric
      if (typeof value === 'boolean') {
        value = value ? 1 : 0;
      }

      ExpressionAttributeNames[attributeName] = name;
      ExpressionAttributeValues[attributeValue] = value;

      if (isKeyCondition) {
        KeyConditionExpression.push(`${attributeName} = ${attributeValue}`);
      } else {
        if (Array.isArray(value)) {
          FilterExpression.push(`${attributeName} IN (${value.map((_, i) => `${attributeValue}${i}`).join(', ')})`);
          value.forEach((val, i) => {
            ExpressionAttributeValues[`${attributeValue}${i}`] = val;
          });
        } else {
          FilterExpression.push(`${attributeName} = ${attributeValue}`);
        }
      }
    };

    // Handle indexed fields for KeyConditionExpression
    this.fields.forEach(({ name, isIndexed, indexName }) => {
      if (isIndexed && searchCriteria[name]) {
        addExpression(name, searchCriteria[name], true);
        delete searchCriteria[name];
        if (indexName) {
          IndexName = indexName;
        }
      }
    });

    // Handle remaining search criteria for FilterExpression
    Object.entries(searchCriteria).forEach(([key, value]) => {
      addExpression(key, value);
    });

    // Determine whether to use Query or Scan
    const useQuery = KeyConditionExpression.length > 0;

    if (useQuery) {
      params.KeyConditionExpression = KeyConditionExpression.join(' AND ');
    } else {
      params.FilterExpression = FilterExpression.length > 0 ? FilterExpression.join(' AND ') : undefined;
    }

    params.ExpressionAttributeNames = Object.keys(ExpressionAttributeNames).length > 0 ? ExpressionAttributeNames : undefined;
    params.ExpressionAttributeValues = Object.keys(ExpressionAttributeValues).length > 0 ? ExpressionAttributeValues : undefined;
    params.IndexName = IndexName;

    const spinnies = new Spinnies();
    spinnies.add('countSpinner', { text: 'Counting documents...' });

    let totalCount = 0;
    let lastEvaluatedKey;

    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await docClient.send(useQuery ? new QueryCommand(params) : new ScanCommand(params));
      totalCount += result.Count;
      spinnies.update('countSpinner', { text: `Counting documents... Total: ${totalCount}` });
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    spinnies.succeed('countSpinner', { text: `Counting documents... Done! Total: ${totalCount}` });

    return totalCount;
  }
}
module.exports = FragmentModel; 