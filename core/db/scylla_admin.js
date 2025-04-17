const client = require('./scylla_client');

const createFileTable = async () => {

  const checkTableExistsQuery = `
    SELECT table_name 
    FROM system_schema.tables 
    WHERE keyspace_name = 'mykeyspace' AND table_name = 'file'
  `;

  try {
    const tableExistsResult = await client.execute(checkTableExistsQuery);
    if (tableExistsResult.rowLength > 0) {
      console.log('Table file already exists');
    }
  } catch (err) {
    console.error('Error checking table existence:', err);
    throw err;
  }

  // Table creation query
  const createTableQuery = `CREATE TABLE IF NOT EXISTS mykeyspace.file (
    id UUID PRIMARY KEY
  )`;

  // Individual column addition queries
  const columnQueries = [
    "ALTER TABLE mykeyspace.file ADD binary blob",
    "ALTER TABLE mykeyspace.file ADD frag UUID",
    "ALTER TABLE mykeyspace.file ADD filename text",
    "ALTER TABLE mykeyspace.file ADD cacheId text",
    "ALTER TABLE mykeyspace.file ADD processId text"
  ];

  try {
    // Execute table creation query
    try {
      await client.execute(createTableQuery);
    } catch (err) {
      console.error('Error executing table creation query:', err);
      throw err;
    }

    // Retrieve existing columns
    const existingColumnsResult = await client.execute(
      "SELECT column_name FROM system_schema.columns WHERE keyspace_name = 'mykeyspace' AND table_name = 'file'"
    );
    const existingColumns = new Set(existingColumnsResult.rows.map(row => row.column_name));

    // Execute each column addition query individually
    for (const query of columnQueries) {
      const columnName = query.match(/ADD (\w+)/)[1]; // Extract column name from query
      const columnNameLowerCase = columnName.toLowerCase(); // Convert to lowercase for case-insensitive comparison
      const existingColumnsLowerCase = new Set([...existingColumns].map(col => col.toLowerCase())); // Convert existing columns to lowercase
      if (!existingColumnsLowerCase.has(columnNameLowerCase)) {
        try {
          await client.execute(query);
        } catch (err) {
          console.error('Error adding column:', err.message);
        }
      }
    }

    // Log the list of existing tables
    try {
      const tablesResult = await client.execute("SELECT table_name FROM system_schema.tables WHERE keyspace_name = 'mykeyspace'");
      const tables = tablesResult.rows.map(row => row.table_name);
      console.log('Tables in Scylla (Cassandra) mykeyspace:', tables);
    } catch (err) {
      console.error('Error retrieving list of tables:', err);
    }

    
    console.log('File table setup completed successfully');

  } catch (error) {
    console.error('Error setting up file table:', error);
    throw error;
  }
};


module.exports = { 
  createFileTable,
}; 