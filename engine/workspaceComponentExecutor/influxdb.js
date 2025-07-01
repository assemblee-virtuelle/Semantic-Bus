'use strict';

const { json } = require('body-parser');
const fragment_lib = require('../../core/lib/fragment_lib_scylla.js');
const DfobProcessor = require('../../core/helpers/dfobProcessor.js');

class InfluxdbConnector {
  constructor () {
    this.influxdbClient = require('@influxdata/influxdb-client');
    this.influxdbClientApi = require('@influxdata/influxdb-client-apis');
    this.stringReplacer = require('../utils/stringReplacer.js');
  }

  // only works with integer fields !!!
  // add fields to the Point influxdb object
  addFieldsToPoint(jsonData,point,fields){
    if (fields) {
      fields.forEach(field => {
        // console.log('fields',field,fields)
        point.intField(field, jsonData[field]);
      })
    }
    return point
  }

  // add tags to the Point influxdb object
  addTagsToPoint(jsonData,point,tags){
    if (tags) {
      tags.forEach(tag => {
        point.tag(tag, jsonData[tag]);
      })
    }
    return point
  }

  // get the fields that weren't given by the user 
  // in the component
  getRemainingFields(jsonData,currentFields){
    const keys = Object.keys(jsonData);
    const remainingFields = [];
    keys.forEach(element => {
      if(currentFields.includes(element)){
        //nothing happens
      } else {
        remainingFields.push(element);
      }
    })

    return remainingFields
  }

  // gets list of tags names
  getTags(data){
    let tags=[];
    if (data.tags != undefined) {
      for (let tag of data.tags) {
        tags.push(tag.tag);
      }
    }
    return tags
  }

  // delete every data from bucket 
  // https://github.com/influxdata/influxdb-client-js/blob/master/examples/delete.ts
  async deleteData(influxDB,org,bucket,measurementType,deleteTags){
    // console.log('*** DELETE DATA ***')
    const deleteAPI = new this.influxdbClientApi.DeleteAPI(influxDB);
    // define time interval for delete operation
    const stop = new Date();
    const start = new Date('01/01/1950');

    let stringDelete = '_measurement="'+measurementType+'"';

    if(deleteTags){
      deleteTags.forEach((element) => {
        stringDelete +=' and '+element.tag+'="'+element.tagValue+'"';
      })
    }

    await deleteAPI.postDelete({
      org,
      bucket,
      body: {
        start: start.toISOString(),
        stop: stop.toISOString(),
        // see https://docs.influxdata.com/influxdb/latest/reference/syntax/delete-predicate/
        predicate: stringDelete,
      },
    });
  }

  // Execute query and receive table metadata and table row values using async iterator.
  async executeQuery(queryApi,querySelect) {
    // console.log('*** IterateRows ***')
    // const fluxQuery = 'from(bucket:"'+bucket+'") |> range(start: -1d) |> filter(fn: (r) => r._measurement == "'+measurementType+'")';
    const fluxQuery = querySelect;
    let data = [];

    for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
      // the following line creates a json object for each row
      const datum = tableMeta.toObject(values)
      data.push(datum);
    }
    // console.log('\nIterateRows SUCCESS');
    return data
  }

  async queryGenerator(influxDB,querySelect,org){
    let data;
    // this builds teh query
    const queryApi = influxDB.getQueryApi(org);

    if(queryApi && querySelect){
      // console.log('entering query !');

      await this.executeQuery(queryApi,querySelect).then( (result) => {
        if(!result){
          throw new Error("Aucune donnée trouvée avec la query");
        } else {
          data = result;
        }
      }).catch ((e) => {
        throw new Error(e);
      })
    }
    return data
  }

  writeDatum(tags,fields,timestamp,measurementType,jsonData,writeApi){
    let result = '';

    try {
      let date = new Date(jsonData[timestamp]);
      if(date.toString().toLowerCase() === "invalid date"){
        throw new Error("Il faut fournir un timestamp et des données valides dans les tags.");
      }
      
      let insertData = true;
      // checking that the data for the tags isn't empty or undefined
      tags.forEach(tag => {
        if(!(jsonData[tag])){
          insertData = false;
        }
      })
      
      if(insertData && writeApi){
        // if we have valid tag values,
        // a valid timestamp and at least one field then
        // we insert the data
        const point1 = new this.influxdbClient.Point(measurementType)
                      .timestamp(date)
        const point2 = this.addTagsToPoint(jsonData,point1,tags)
        const point3 = this.addFieldsToPoint(jsonData,point2,fields);
        // console.log('point3',point3)
      
        // then we write the data
        writeApi.writePoint(point3);
        result  = point3;
        writeApi.close();
      } 
    } catch(e) {
        console.log('Error : ',e);
    }
    return result;
  }

  // same code as writeDatum except we iterate over the data
  // and we close the api at the end of the iteration
  writeData(tags,fields,timestamp,measurementType,jsonData,writeApi){
    //console.log('writedata');
    let result =  [];

    jsonData.forEach(datum => {
      try {
        let date = new Date(datum[timestamp]);
        if(date.toString().toLowerCase() === "invalid date"){
          throw new Error("Il faut fournir un timestamp et des données valides dans les tags.");
        }
        
        let insertData = true;
        // checking that the data for the tags isn't empty or undefined
        tags.forEach(tag => {
          if(!(datum[tag])){
            insertData = false;
          }
        })
        
        if(insertData && writeApi){
          // if we have valid tag values,
          // a valid timestamp and at least one field then
          // we insert the data
          const point1 = new this.influxdbClient.Point(measurementType)
                        .timestamp(date)
          const point2 = this.addTagsToPoint(datum,point1,tags)
          const point3 = this.addFieldsToPoint(datum,point2,fields);        
          // then we write the data
          writeApi.writePoint(point3);
          result.push(point3);
        } 
      } catch(e) {
          console.log('Error : ',e);
      }
    });
    // we let the api connection open until the end
    writeApi.close();

    return result;
  }

  prepareData(data,jsonData,influxDB,org,bucket,measurementType){
    let result = {};
    try{
      if(!(data.specificData && data.specificData.measurementInsert && data.specificData.bucketInsert)){
        reject(new Error("Il faut fournir le nom de la mesure et le nom du bucket"))
      }

      const writeApi = influxDB.getWriteApi(org, bucket);
      const tags = this.getTags(data.specificData);
      const timestamp = data.specificData.timestamp;

      // every field entered by the user
      const inputFields = [data.specificData.timestamp];
      if(tags.length > 0){
        inputFields.push(...tags);
      }

      if(!(timestamp)){
        throw new Error("Il faut fournir un timestamp");
      } 

      // when the data given is an array of objects ->>>
      if(Array.isArray(data)){
        // gets the fields that weren't entered by the user according to first object?
        // we take the first object for the array
        const fields = this.getRemainingFields(jsonData[0],inputFields);
        if(!(fields.length > 0)){
          throw new Error("Il faut qu'il y ait au moins un champs en entrée (field).");
        }
        result = this.writeData(tags,fields,timestamp,measurementType,jsonData,writeApi);
        // when the data given is just an object ->>>
      }else {
        const fields = this.getRemainingFields(jsonData,inputFields);
        if(!(fields.length > 0)){
          throw new Error("Il faut qu'il y ait au moins un champs en entrée (field).");
        }
        result = this.writeDatum(tags,fields,timestamp,measurementType,jsonData,writeApi);
      }
    }
    catch (e) {
      throw new Error(e);
    }
    
    return result;
  }

  // doc of the influx client API on ->>>
  // https://github.com/influxdata/influxdb-client-js/blob/master/examples/write.mjs
  async workWithFragments(data, flowData, pullParams, processId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the input fragment and dfob
        const inputFragment = flowData[0]?.fragment;
        const inputDfob = flowData[0]?.dfob;
        
        if (!inputFragment) {
          resolve();
          return;
        }

        // Get data from fragment
        let rebuildDataRaw = await fragment_lib.getWithResolutionByBranch(inputFragment.id);

        // Process the data with InfluxDB operations
        const rebuildData = await DfobProcessor.processDfobFlow(
          rebuildDataRaw,
          { 
            pipeNb: inputDfob?.pipeNb, 
            dfobTable: inputDfob?.dfobTable, 
            keepArray: inputDfob?.keepArray,
            delayMs: inputDfob?.delayMs || 0
          },
          this,
          this.processInfluxItem,
          (item) => {
            return [
              data, 
              [{ data: item }], 
              pullParams
            ];
          },
          async () => {
            return true;
          }
        );

        // Persist the transformed data
        await fragment_lib.persist(rebuildData, undefined, inputFragment);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
  
  async processInfluxItem(data, flowData, pullParams) {
    // This function will process a single item using the same logic as pull
    try {
      if(!(data.specificData && data.specificData.url && data.specificData.apiKey)){
        throw new Error("Il faut fournir l'url et la clé influx");
      }
      if(!(data.specificData && data.specificData.organization)){
        throw new Error("Il faut fournir le nom de l'organisation");
      }

      const insertData = data.specificData.insertChecked == 'checked' ? true : false;
      const deleteData = data.specificData.deleteChecked == 'checked' ? true : false;
      const requestData = data.specificData.requestChecked == 'checked' ? true : false;

      const url = data.specificData.url;
      const token = data.specificData.apiKey;
      const org = data.specificData.organization;
      // depends on the choice made ->>>
      const jsonData = flowData ? flowData[0].data : {};

      // creation of the communication interface for influxdb
      const influxDB = new this.influxdbClient.InfluxDB({url, token, timeout: 1000000});

      let insertDataReturned;
      let requestDataReturned;

      if(deleteData){
        if(!(data.specificData && data.specificData.measurementDelete && data.specificData.bucketDelete)){
          throw new Error("Il faut fournir le nom de la mesure et le nom du bucket pour la suppression.");
        }

        let bucket = data.specificData.bucketDelete;
        let measurementType = data.specificData.measurementDelete;

        // we delete everything in the bucket from now to year 1950
        const deleteTags = data.specificData.tagDelete;

        await this.deleteData(influxDB, org, bucket, measurementType, deleteTags);
      }
      
      if(insertData){
        if(!(data.specificData && data.specificData.measurementInsert && data.specificData.bucketInsert)){
          throw new Error("Il faut fournir le nom de la mesure te le nom du bucket");
        }
        const bucket = data.specificData.bucketInsert;
        const measurementType = data.specificData.measurementInsert;

        insertDataReturned = this.prepareData(data, jsonData, influxDB, org, bucket, measurementType);
      }
      
      if(requestData){
        const querySelectString = data.specificData.querySelect;
        const querySelect = this.stringReplacer.execute(querySelectString, pullParams, flowData?flowData[0].data:undefined);

        requestDataReturned = await this.queryGenerator(influxDB, querySelect, org);
      }

      // Return appropriate data based on operations performed
      if(requestData){
        return requestDataReturned;
      }
      else if((!deleteData && insertData && !requestData) || 
        (deleteData && insertData && !requestData)){
        return insertDataReturned;
      }
      else if(deleteData && !insertData && !requestData) {
        return jsonData;
      } else{
        return {};
      }
    } catch(e) {
      throw e;
    }
  }

  pull (data, flowData, pullParams) {
    return new Promise(async (resolve, reject) => {
      try {
          if(!(data.specificData && data.specificData.url && data.specificData.apiKey)){
            reject(new Error("Il faut fournir l'url et la clé influx"))
          }
          if(!(data.specificData && data.specificData.organization)){
            reject(new Error("Il faut fournir le nom de l'organisation"))
          }

          const insertData = data.specificData.insertChecked == 'checked' ? true : false;
          const deleteData = data.specificData.deleteChecked == 'checked' ? true : false;
          const requestData = data.specificData.requestChecked == 'checked' ? true : false;

          const url = data.specificData.url;
          const token = data.specificData.apiKey;
          const org = data.specificData.organization;
          // depends on the choice made ->>>
          const jsonData = flowData ? flowData[0].data : {};

          // creation of the communication interface for influxdb
          const influxDB = new this.influxdbClient.InfluxDB({url, token,timeout: 1000000});

          let insertDataReturned;
          let requestDataReturned;

          if(deleteData){
            //console.log('supprimer');
            if(!(data.specificData && data.specificData.measurementDelete && data.specificData.bucketDelete)){
              reject(new Error("Il faut fournir le nom de la mesure et le nom du bucket pour la suppression."))
            }

            let bucket = data.specificData.bucketDelete;
            let measurementType = data.specificData.measurementDelete;

            // we delete everything in the bucket from now to year 1950
            const deleteTags =  data.specificData.tagDelete;

            await this.deleteData(influxDB,org,bucket,measurementType,deleteTags)
              .catch((error) => {
                reject(new Error(error));
              });
            }
          if(insertData){
            //console.log('inserer');

            if(!(data.specificData && data.specificData.measurementInsert && data.specificData.bucketInsert)){
              reject(new Error("Il faut fournir le nom de la mesure te le nom du bucket"))
            }
            const bucket = data.specificData.bucketInsert;
            const measurementType = data.specificData.measurementInsert;

            insertDataReturned = this.prepareData(data,jsonData,influxDB,org,bucket,measurementType);
          }
          if(requestData){
            // console.log('requeter');
            const querySelectString = data.specificData.querySelect;

            const querySelect = this.stringReplacer.execute(querySelectString, pullParams, flowData?flowData[0].data:undefined);

            await this.queryGenerator(influxDB,querySelect,org).then((result) => {
              // console.log('data : ',result);
              requestDataReturned = result;
            }).catch( (error) => {
              reject(new Error(error));
            })
          }

          // what we return every time a request is made 
          // if request or request + insertion or request + insertion + delete
          // or delete + request
          if(requestData){
            resolve({data : requestDataReturned});
          }
          else if((!deleteData && insertData && !requestData) || 
            (deleteData && insertData && !requestData)){
            resolve({data : insertDataReturned});
          }
          // if only delete we return the entry data
          else if(deleteData && !insertData && !requestData) {
            resolve({data : jsonData});
          } else{
            resolve({})
          }
        } catch(e) {
        reject(e)
      }
    })
  }

}

module.exports = new InfluxdbConnector()
