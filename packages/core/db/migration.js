const scyllaModel = require('../models/fragments_model_scylla');
const dynamoModel = require('../models/fragments_model_scylla');
const Spinnies = require('spinnies');
const spinnies = new Spinnies();

async function migrateFragmentsDataFromScyllaToDynamoDB() {
  const limit = Infinity;
  console.log('Starting migration from Scylla to DynamoDB...');

  // Count the number of records before starting the migration
  let totalRecords = await scyllaModel.countDocuments({});
  totalRecords = Math.min(totalRecords, limit);
  console.log(`Total records to migrate: ${totalRecords}`);

  let totalMigrated = 0;
  let lastProcessedTime = Date.now();
  let hasLoggedInactivity = false; // Flag to track if inactivity has been logged

  const logIfInactive = () => {
    const now = Date.now();
    if (!hasLoggedInactivity && now - lastProcessedTime >= 1000) {
      // console.log(`Total migrated: ${totalMigrated}`);
      spinnies.succeed('migration', { text: `Migration in progress: ${totalMigrated} records migrated` });
      hasLoggedInactivity = true; // Set the flag to true after logging
    } else if (!hasLoggedInactivity) {
      setTimeout(logIfInactive, 1000); // Schedule the next check only if not logged
    }
  };

  // Initial call to start the timeout chain
  setTimeout(logIfInactive, 1000);

  const processRecords = async(scyllaDataArray) => {
    for (const scyllaData of scyllaDataArray) {
      lastProcessedTime = Date.now(); // Update the last processed time
      hasLoggedInactivity = false; // Reset the flag when a record is processed

      const fragment = {
        id: scyllaData.id,
        data: scyllaData.data,
        originFrag: scyllaData.originfrag,
        rootFrag: scyllaData.rootfrag,
        branchOriginFrag: scyllaData.branchoriginfrag,
        branchFrag: scyllaData.branchfrag,
        garbageTag: scyllaData.garbagetag,
        garbageProcess: scyllaData.garbageprocess,
        indexArray: scyllaData.indexarray,
        maxIndexArray: scyllaData.maxindexarray
      };

      try {
        // Check if the fragment already exists in DynamoDB
        let existingFragment;
        try {
          existingFragment = await dynamoModel.getFragmentById(fragment.id.toString());
        } catch (error) {
        }
        totalMigrated += 1;
        if (totalMigrated % 1000 === 0) {
          spinnies.update('migration', { text: `Migration in progress: ${totalMigrated}` });
        }
        if (!existingFragment) {
          await dynamoModel.insertFragment(fragment);
        }
      } catch (error) {
        console.error('Error migrating record:', error);
        throw error;
      }
    }
  };

  spinnies.add('migration', { text: 'Migration in progress: Starting...' });
  scyllaModel.searchFragmentByField({}, {}, {}, limit, processRecords);

  // console.log(`Migration completed. Total records migrated: ${totalMigrated}`);
}

module.exports = { migrateFragmentsDataFromScyllaToDynamoDB };
