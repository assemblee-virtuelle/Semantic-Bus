'use strict'

class SqlConnector {
  constructor() {
    this.stringReplacer = require('../utils/stringReplacer.js');
    this.Sequelize = require('sequelize');
  }

  async initialise(driver, host, port, username, password, database) {
    // console.log("----- initialize sql -----")
    const sequelize = new this.Sequelize(database, username, password, {
      host: host,
      port: port,
      dialect: driver,
      ssl: false,
      pool: {
        max: 100,
        min: 0,
        idle: 10000
      }
    })
    return sequelize
  }

  async request(query, sequelize, flowData, pullParams) {
    query = this.stringReplacer.execute(query, pullParams, flowData);
  
    try {
      const [SQLResult, metadata] = await sequelize.query(query);
  
      // Check if the query is a SELECT query
      if (query.trim().toLowerCase().includes('select')) {
        // If it's a SELECT query, map the results
        const resultData = Array.isArray(SQLResult) ? SQLResult.map(item => ({ ...item })) : [];
        return resultData;
      } else {
        // For non-SELECT queries, return a meaningful response or handle accordingly
        return "La requête a bien été exécutée.";
      }
    } catch (err) {
      let fullError = new Error(err);
      fullError.displayMessage = 'Connecteur SQL : Mauvais format de requete SQL';
      throw fullError;
    }
  }

  pull(data, flowData, pullParams) {
    return new Promise(async (resolve, reject) => {
      try {
        const schemaSeq = await this.initialise(data.specificData.driver, data.specificData.host, data.specificData.port, data.specificData.username, data.specificData.password, data.specificData.database)
        const bddData = await this.request(data.specificData.querySelect, schemaSeq, flowData?flowData[0].data:undefined, pullParams);
        resolve({
          data: bddData
        })
      } catch (error) {
        reject (error)
      }
    })
  }
}

module.exports = new SqlConnector()
