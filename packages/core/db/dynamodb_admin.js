const { DescribeTableCommand, CreateTableCommand, UpdateTableCommand, ListTablesCommand, DeleteTableCommand, ScanCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const dynamoDBClients = require('./dynamodb_client');

const commonParams = {
  TableName: 'fragment',
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'originFrag', AttributeType: 'S' },
    { AttributeName: 'branchOriginFrag', AttributeType: 'S' },
    { AttributeName: 'garbageTag', AttributeType: 'N' },
    { AttributeName: 'garbageProcess', AttributeType: 'N' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'OriginFragIndex',
      KeySchema: [
        { AttributeName: 'originFrag', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'BranchOriginFragIndex',
      KeySchema: [
        { AttributeName: 'branchOriginFrag', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'GarbageTagIndex',
      KeySchema: [
        { AttributeName: 'garbageTag', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      IndexName: 'GarbageProcessIndex',
      KeySchema: [
        { AttributeName: 'garbageProcess', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ]
};

const createTable = async(tableName, params) => {
  const { dynamodb } = await dynamoDBClients;
  try {
    const createTableCommand = new CreateTableCommand(params);
    await dynamodb.send(createTableCommand);
    console.log(`Table ${tableName} created successfully`);
  } catch (createError) {
    console.error(`Error creating table ${tableName}:`, createError);
    throw createError;
  }
};

const compareTableStructure = (existingTable, commonParams) => {
  // Helper function to sort arrays of objects by a specific key
  const sortByKey = (array, key) => {
    return array.slice().sort((a, b) => (a[key] > b[key] ? 1 : -1));
  };

  // Helper function to sort object properties
  const sortObjectProperties = (obj) => {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
  };

  // Function to remove non-comparable properties
  const sanitizeIndex = (index) => {
    const { IndexArn, ProvisionedThroughput, ...comparableIndex } = index; // Remove IndexArn and ProvisionedThroughput
    return comparableIndex;
  };

  // Compare AttributeDefinitions
  const existingAttributes = sortByKey(existingTable.AttributeDefinitions, 'AttributeName').map(sortObjectProperties);
  const commonAttributes = sortByKey(commonParams.AttributeDefinitions, 'AttributeName').map(sortObjectProperties);

  const attributesMatch = JSON.stringify(existingAttributes) === JSON.stringify(commonAttributes);
  if (!attributesMatch) {
    console.log('AttributeDefinitions differ:');
    console.log('Existing:', existingAttributes);
    console.log('Expected:', commonAttributes);
  }

  // Compare KeySchema
  const existingKeySchema = sortByKey(existingTable.KeySchema, 'AttributeName').map(sortObjectProperties);
  const commonKeySchema = sortByKey(commonParams.KeySchema, 'AttributeName').map(sortObjectProperties);

  const keySchemaMatch = JSON.stringify(existingKeySchema) === JSON.stringify(commonKeySchema);
  if (!keySchemaMatch) {
    console.log('KeySchema differ:');
    console.log('Existing:', existingKeySchema);
    console.log('Expected:', commonKeySchema);
  }

  // Compare GlobalSecondaryIndexes
  const existingIndexes = sortByKey(existingTable.GlobalSecondaryIndexes || [], 'IndexName').map(sanitizeIndex);
  const commonIndexes = sortByKey(commonParams.GlobalSecondaryIndexes || [], 'IndexName').map(sanitizeIndex);

  const indexesMatch = JSON.stringify(existingIndexes) === JSON.stringify(commonIndexes);
  if (!indexesMatch) {
    console.log('GlobalSecondaryIndexes differ:');
    for (const index of existingIndexes) {
      console.log('Existing:', JSON.stringify(index));
    }
    for (const index of commonIndexes) {
      console.log('Expected:', JSON.stringify(index));
    }
  }

  return attributesMatch && keySchemaMatch && indexesMatch;
};

const createFragmentTable = async() => {
  const { dynamodb } = await dynamoDBClients;

  try {
    // Check if the table already exists
    const describeTableCommand = new DescribeTableCommand({ TableName: 'fragment' });
    const existingTable = await dynamodb.send(describeTableCommand);
    console.log('Table fragment already exists');

    // Compare existing table structure with commonParams
    if (!compareTableStructure(existingTable.Table, commonParams)) {
      console.log('Table structure differs from commonParams, updating table...');
      await backupAndRecreateTable();
    } else {
      console.log('Table structure matches commonParams, no update needed.');
      // console.log('existingTable',JSON.stringify(existingTable));
    }
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      // Table does not exist, create it
      await createTable('fragment', commonParams);
    } else {
      console.error('Error checking table existence:', error);
      throw error;
    }
  } finally {
    try {
      // List all tables in DynamoDB
      const listTablesCommand = new ListTablesCommand({});
      const tables = await dynamodb.send(listTablesCommand);
      console.log('Tables in DynamoDB:', tables.TableNames);
    } catch (listError) {
      console.error('Error listing tables:', listError);
    }
    console.log('Fragment table setup completed successfully');
  }
};

const backupAndRecreateTable = async() => {
  const { dynamodb } = await dynamoDBClients;

  try {
    // Check if the fragment table exists
    const describeTableCommand = new DescribeTableCommand({ TableName: 'fragment' });
    await dynamodb.send(describeTableCommand);

    // Check if the fragmentBackup table exists and delete it if it does
    try {
      const describeBackupTableCommand = new DescribeTableCommand({ TableName: 'fragmentBackup' });
      await dynamodb.send(describeBackupTableCommand);

      // If the backup table exists, delete it
      const deleteBackupTableCommand = new DeleteTableCommand({ TableName: 'fragmentBackup' });
      await dynamodb.send(deleteBackupTableCommand);
      console.log('Existing backup table fragmentBackup deleted successfully');
    } catch (backupError) {
      if (backupError.name !== 'ResourceNotFoundException') {
        console.error('Error checking backup table existence:', backupError);
        throw backupError;
      }
    }

    // Create a backup table with the same schema
    const backupParams = {
      ...commonParams,
      TableName: 'fragmentBackup'
    };
    await createTable('fragmentBackup', backupParams);

    // Copy data from fragment to fragmentBackup
    await copyTableData('fragment', 'fragmentBackup');
    console.log('Data copied to fragmentBackup successfully');

    // Delete the original fragment table
    const deleteTableCommand = new DeleteTableCommand({ TableName: 'fragment' });
    await dynamodb.send(deleteTableCommand);
    console.log('Original table fragment deleted successfully');

    // Recreate the fragment table
    await createTable('fragment', commonParams);

    // Copy data back from fragmentBackup to fragment
    await copyTableData('fragmentBackup', 'fragment');
    console.log('Data copied back to fragment successfully');

    // Delete the backup table
    const deleteBackupTableCommand = new DeleteTableCommand({ TableName: 'fragmentBackup' });
    await dynamodb.send(deleteBackupTableCommand);
    console.log('Backup table fragmentBackup deleted successfully');
  } catch (error) {
    console.error('Error during backup and recreation process:', error);
    throw error;
  }
};

const copyTableData = async(sourceTable, destinationTable) => {
  const { dynamodb } = await dynamoDBClients;
  console.log(`Copying data from ${sourceTable} to ${destinationTable}`);

  try {
    // Scan the source table
    const scanCommand = new ScanCommand({ TableName: sourceTable });
    const scanResults = await dynamodb.send(scanCommand);

    console.log(`Scan results: ${scanResults.Items.length} items`);

    let count = 0;
    // Insert each item into the destination table
    for (const item of scanResults.Items) {
      // Remove all NULL properties
      for (const key in item) {
        if (item[key] && item[key].NULL) {
          delete item[key];
        }
      }
      console.log(`Copying item ${count} of ${scanResults.Items.length}`);
      const putItemCommand = new PutItemCommand({
        TableName: destinationTable,
        Item: item
      });
      await dynamodb.send(putItemCommand);
      count++;
    }

    console.log(`Data copied from ${sourceTable} to ${destinationTable} successfully: ${count} items`);
  } catch (error) {
    console.error(`Error copying data from ${sourceTable} to ${destinationTable}:`, error);
    throw error;
  }
};

module.exports = { createFragmentTable, backupAndRecreateTable };
