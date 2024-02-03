'use strict';

const { json } = require('body-parser');

class InfluxdbConnector {
  constructor () {
    this.config = require('../configuration.js');
    this.influxdbClient = require('@influxdata/influxdb-client');
    this.influxdbClientApi = require('@influxdata/influxdb-client-apis');
    this.stringReplacer = require('../utils/stringReplacer.js');
  }

    /* TODO :
    - gérer les types : strings ou api influx (integer only?)
    - gérer temps de suppression données start et end

    optimisation :
    - batchs de 5000 lignes
    - ordonner les tags par clé ordre lexicographique
    - compression gzip requête http post -> créer composant gzip 
  */

  /*
  // OLD CODE used to send data in influxdbbucket with 2 other components HTTP consumer 
  // (Post Request) and a Js Evaluation with an accumulator function to put 
  // every data in the same string
  
  stringDataBuilder(jsonData,data,fieldsetString,tagString) {
    // you should refer to the pages on the influxdb line protocol
    // https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#naming-restrictions

    // influxdb data type = string
    const measurementName = data.measurement;

    const fieldSet = fieldsetString;

    // the timestamp needs to be in the ISO format
    // like this : ,               1654940402000, the influxISO format
    //     1677687240000 13
    // has 6 more 0s at the end -> 1422568543702900257 19
    let result;
    let timestamp = '';
    if(jsonData[data.timestamp]){
      const date = new Date(jsonData[data.timestamp]);
      if(date.toDateString().toLowerCase() !== 'invalid date'){
        timestamp = date.getTime().toString();
        if(timestamp.length < 19){
          const nberOfZerosToAdd = 18 - timestamp.length;
          for (let index = 0; index < nberOfZerosToAdd; index++) {
            timestamp+="0";
          }
        }
        result = measurementName +
        // optional
        tagString
        // the blank space separates the measurement
        // name and tag set from the field set
        + " " +
        fieldSet;

        if(timestamp){
          result += " " + timestamp
        }
        // each data is a line separated by a /n
        result += + " " + "\n";
      }
    }
    return result
  }

  fieldsetStringBuilder(jsonData,fields){
    let fieldsetString = '';
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      const field_value = jsonData[field];
      fieldsetString += (field + "=" + field_value);
      if(index != (fields.length-1)){
        fieldsetString += ","
      }
    }
    return fieldsetString
  }

  tagStringBuilder(jsonData,tags){
    let tagString = '';
    for (let index = 0; index < tags.length; index++) {
      const tag = tags[index];
      const tag_value = jsonData[tag];
      tagString += ("," + tag + "=" + tag_value);
    }
    return tagString
  }


  // CODE IN BODY OF INFLUXDB COMPONENT ->>>>
    const jsonData = flowData[0].data;
    let result = '';
    if(!(data.specificData && data.specificData.measurement)){
      reject(new Error("Il faut fournir le nom de la mesure"))
    }

    if(!(flowData[0].data)){
    } else {
      const tags = this.getTags(data.specificData);

      // every field entered by the user
      const inputFields = [data.specificData.timestamp];
      if(tags.length != 0){
        inputFields.push(...tags);
      }

      const fields = this.getRemainingFields(jsonData,inputFields);

      if(!(fields.length > 0)){
        reject(new Error("Il faut qu'il y ait au moins un champs en entrée (field)."))
      }

      // array containing every used field :
      const everyField = Array.from(fields);
      everyField.push(...inputFields);
      everyField.push(data.specificData.measurement);

      everyField.forEach(element => {
        // https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/
        if(element && (element == "_field" || element == "measurement" || element == "time")){
          reject(new Error("Un nom de champs s'appelle time ou _field ou _measurement."))
        }
      });

      const fieldsetString = this.fieldsetStringBuilder(jsonData,fields);
      const tagString = this.tagStringBuilder(jsonData,tags);

      result = this.stringDataBuilder(jsonData,data.specificData,fieldsetString,tagString)
      if(result !== undefined){
        resolve({
          data: result
        })
      }
      else {
        return
      }*/

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
