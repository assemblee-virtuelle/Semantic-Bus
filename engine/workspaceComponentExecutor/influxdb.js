'use strict';

class InfluxdbConnector {
  constructor () {
    this.config = require('../configuration.js');
    this.influxdbClient = require('@influxdata/influxdb-client');
    this.influxdbClientApi = require('@influxdata/influxdb-client-apis');
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
  async deleteData(influxDB,org,bucket,measurementType,deleteTag,deleteTagValue){
    // console.log('*** DELETE DATA ***')
    const deleteAPI = new this.influxdbClientApi.DeleteAPI(influxDB);
    // define time interval for delete operation
    const stop = new Date();
    const start = new Date('01/01/2000');

    await deleteAPI.postDelete({
      org,
      bucket,
      body: {
        start: start.toISOString(),
        stop: stop.toISOString(),
        // see https://docs.influxdata.com/influxdb/latest/reference/syntax/delete-predicate/
        predicate: '_measurement="'+measurementType+'" and '+deleteTag+'="'+deleteTagValue+'"',
      },
    });
  }

  // Execute query and receive table metadata and table row values using async iterator.
  async iterateRows(queryApi,querySelect) {
    // console.log('*** IterateRows ***')
    // const fluxQuery = 'from(bucket:"'+bucket+'") |> range(start: -1d) |> filter(fn: (r) => r._measurement == "'+measurementType+'")';
    const fluxQuery = querySelect;
    let data = [];
    // console.log(fluxQuery);
    for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
      // the following line creates a json object for each row
      const datum = tableMeta.toObject(values)
      // console.log(JSON.stringify(o, null, 2))
      data.push(datum);
    }
    // console.log('\nIterateRows SUCCESS');
    return data
  }

  async queryGenerator(influxDB,querySelect,org){
    const queryApi = influxDB.getQueryApi(org);
    let data;
    // first if there is a query we ask it

    if(queryApi && querySelect){
      // console.log('entering query !');

      await this.iterateRows(queryApi,querySelect).then( (result) => {
        // console.log(data);
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

  writeData(jsonData,influxDB,timestamp,fields,tags,org,bucket,measurementType){
    const writeApi = influxDB.getWriteApi(org, bucket);
    let result = 'donnée non insérée';
    let date;
    
    try {
      if(!(fields.length > 0)){
        throw new Error("Il faut qu'il y ait au moins un champs en entrée (field).");
      }
      else if(!(timestamp)){
        throw new Error("Il faut fournir un timestamp");
      } else{
        // TODO -> if/else???
          date = new Date(jsonData[timestamp]);
          if(date.toString().toLowerCase() === "invalid date"){
            throw new Error("Il faut fournir un timestamp et des données valides dans les tags.");
          }
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

        // console.log(point3);
      
        // then we write the data
        
        writeApi.writePoint(point3);
        result  = 'donnée insérée';
        writeApi.close();
      } 
    } catch(e) {
        console.log('Error : ',e);
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

          const choice = data.specificData.choice;
          // console.log('CHOICE MADE : ',choice);

          const url = data.specificData.url;
          const token = data.specificData.apiKey;
          const org = data.specificData.organization;
          const bucket = data.specificData.bucket ? data.specificData.bucket : '';
          const measurementType = data.specificData.measurement ? data.specificData.measurement : '';
          const jsonData = flowData ? flowData[0].data : {};

          // console.log('data : ',jsonData);

          // creation of the communication interface for influxdb
          const influxDB = new this.influxdbClient.InfluxDB({url, token});

          switch (choice) {
            case "inserer":
              // console.log('writedata');
              if(!(data.specificData && data.specificData.measurement && data.specificData.bucket)){
                reject(new Error("Il faut fournir le nom de la mesure te le nom du bucket"))
              }
              const tags = this.getTags(data.specificData);
              const timestamp = data.specificData.timestamp;

              // every field entered by the user
              const inputFields = [data.specificData.timestamp];
              if(tags.length > 0){
                inputFields.push(...tags);
              }

              // gets the fields that weren't entered by the user
              const fields = this.getRemainingFields(jsonData,inputFields);
              const result = this.writeData(jsonData,influxDB,timestamp,fields,tags,org,bucket,measurementType);
              // console.log(result);
              resolve({'data' : jsonData})
              break;

            case "supprimer":
              // console.log('deletedata');
              if(!(data.specificData && data.specificData.measurement && data.specificData.bucket)){
                reject(new Error("Il faut fournir le nom de la mesure te le nom du bucket"))
              }

              // we delete everything in the bucket from now to year 2000
              const deleteTagValue = data.specificData.deleteTagValue;
              const deleteTag = data.specificData.deleteTag;

              await this.deleteData(influxDB,org,bucket,measurementType,deleteTag,deleteTagValue)
                .then(() => {
                  // console.log('\nSuppression des données');
                  // console.log('jsonData : ',jsonData);
                  resolve({'data' : jsonData});
                })
                .catch((error) => {
                  // console.error(error);
                  reject(new Error('Suppression des données non réalisée'));
                  // console.log('\nFinished ERROR')
                });
              break;

            case "requeter":
              // console.log('querySelect');
              const querySelect = data.specificData.querySelect;

              await this.queryGenerator(influxDB,querySelect,org).then((result) => {
                // console.log('data : ',result);
                resolve({'data' : result})
              }).catch( (e) => {
                // console.log(e);
                reject(new Error(e));
              })
              break;

            default:
              break;
          }
          // if choice is undefined ->>>
          resolve({data : {}})

        } catch(e) {
        reject(e)
      }
    })
  }

}

module.exports = new InfluxdbConnector()
