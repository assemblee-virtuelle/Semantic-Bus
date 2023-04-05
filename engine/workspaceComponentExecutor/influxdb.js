'use strict';

class InfluxdbConnector {
  constructor () {
    this.config = require('../configuration.js');
    this.influxdbClient = require('@influxdata/influxdb-client');
    this.influxdbClientApi = require('@influxdata/influxdb-client-apis');
  }

    /* TODO :
    - gérer les types : strings ou api influx (integer only?)
    - sécuriser clé api dans grappe?

    optimisation :
    - batchs de 5000 lignes
    - ordonner les tags par clé ordre lexicographique
    - compression gzip requête http post -> créer composant gzip 
  */

  // stringDataBuilder(jsonData,data,fieldsetString,tagString) {
  //   // you should refer to the pages on the influxdb line protocol
  //   // https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#naming-restrictions

  //   // influxdb data type = string
  //   const measurementName = data.measurement;

  //   const fieldSet = fieldsetString;

  //   // the timestamp needs to be in the ISO format
  //   // like this : ,               1654940402000, the influxISO format
  //   //     1677687240000 13
  //   // has 6 more 0s at the end -> 1422568543702900257 19
  //   let result;
  //   let timestamp = '';
  //   if(jsonData[data.timestamp]){
  //     const date = new Date(jsonData[data.timestamp]);
  //     if(date.toDateString().toLowerCase() !== 'invalid date'){
  //       timestamp = date.getTime().toString();
  //       if(timestamp.length < 19){
  //         const nberOfZerosToAdd = 18 - timestamp.length;
  //         for (let index = 0; index < nberOfZerosToAdd; index++) {
  //           timestamp+="0";
  //         }
  //       }
  //       result = measurementName +
  //       // optional
  //       tagString
  //       // the blank space separates the measurement
  //       // name and tag set from the field set
  //       + " " +
  //       fieldSet;

  //       if(timestamp){
  //         result += " " + timestamp
  //       }
  //       // each data is a line separated by a /n
  //       result += + " " + "\n";
  //     }
  //   }
  //   return result
  // }

  // fieldsetStringBuilder(jsonData,fields){
  //   let fieldsetString = '';
  //   for (let index = 0; index < fields.length; index++) {
  //     const field = fields[index];
  //     const field_value = jsonData[field];
  //     fieldsetString += (field + "=" + field_value);
  //     if(index != (fields.length-1)){
  //       fieldsetString += ","
  //     }
  //   }
  //   return fieldsetString
  // }

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

  // tagStringBuilder(jsonData,tags){
  //   let tagString = '';
  //   for (let index = 0; index < tags.length; index++) {
  //     const tag = tags[index];
  //     const tag_value = jsonData[tag];
  //     tagString += ("," + tag + "=" + tag_value);
  //   }
  //   return tagString
  // }

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

  // old pull code
  /*const jsonData = flowData[0].data;
    let result = '';
    if(!(data.specificData && data.specificData.measurement)){
      reject(new Error("Il faut fournir le nom de la mesure"))
    }

    if(!(flowData[0].data)){
      // console.log('empty data here');
    } else {
      // console.log(flowData[0].data);
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
      // console.log("everyfield : ",everyField.toString());

      everyField.forEach(element => {
        // console.log("first for :",element);
        // https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/
        if(element && (element == "_field" || element == "measurement" || element == "time")){
          reject(new Error("Un nom de champs s'appelle time ou _field ou _measurement."))
        }
      });

      // console.log("inputfi ", inputFields);
      // console.log("remaining strings : ",fields);

      const fieldsetString = this.fieldsetStringBuilder(jsonData,fields);
      // console.log("before tagstring");
      const tagString = this.tagStringBuilder(jsonData,tags);
      // console.log("tagstring : ",tagString);

      result = this.stringDataBuilder(jsonData,data.specificData,fieldsetString,tagString)
      // console.log("result : ",result);
      if(result !== undefined){
        console.log(result);
        resolve({
          data: result
        })
      }
      else {
        return
      }*/


  // delete every data from bucket 
  // https://github.com/influxdata/influxdb-client-js/blob/master/examples/delete.ts
  async deleteData(influxDB,org,bucket,measurementType,location){
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
        predicate: '_measurement="'+measurementType+'" and location="'+location+'"',
      },
    });
  }

  // Execute query and receive table metadata and table row values using async iterator.
  async iterateRows(bucket,measurementType,queryApi,querySelect) {
    console.log('*** IterateRows ***')
    // const fluxQuery = 'from(bucket:"'+bucket+'") |> range(start: -1d) |> filter(fn: (r) => r._measurement == "'+measurementType+'")';
    const fluxQuery = querySelect;
    let data = [];
    console.log(fluxQuery);
    for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
      // the following line creates a json object for each row
      const datum = tableMeta.toObject(values)
      // console.log(JSON.stringify(o, null, 2))
      data.push(datum);
    }
    console.log('\nIterateRows SUCCESS');
    return data
  }

  async queryGenerator(influxDB,querySelect,bucket,measurementType,org){
    const queryApi = influxDB.getQueryApi(org);
    let data;
    // first if there is a query we ask it

    if(queryApi && querySelect){
      console.log('entering query !');
      console.log('bucket ',bucket);
      console.log('measurementType : ',measurementType);

      await this.iterateRows(bucket,measurementType,queryApi,querySelect).then( (result) => {
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
    let result;
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

      // test -> if location is empty we do not delete the datas
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

        console.log(point3);
      
        // then we write the data
        
        writeApi.writePoint(point3);
        writeApi.close().then( () => {
          result  = 'donnée insérées';
        })
      } else{
        result  = 'donnée non insérées';
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
          if(!(data.specificData && data.specificData.bucket && data.specificData.organization)){
            reject(new Error("Il faut fournir le nom du bucket et de l'organisation"))
          }
          if(!(data.specificData && data.specificData.measurement)){
            reject(new Error("Il faut fournir le nom de la mesure"))
          }

          const url = data.specificData.url;
          const token = data.specificData.apiKey;
          const org = data.specificData.organization;
          const bucket = data.specificData.bucket;
          const measurementType = data.specificData.measurement;
          const timestamp = data.specificData.timestamp;
          const querySelect = data.specificData.querySelect;

          // TODO when removal of data we have to choose a field ! location temporary
          const location = flowData ? flowData[0].data['location'] : '';
          // console.log('location : ',location);

          let deleteData = !(data.specificData.notErase);

          // creation of the communication interface for influxdb
          const influxDB = new this.influxdbClient.InfluxDB({url, token});
          
          // we delete everything in the bucket from now to year 2000
          // we either delete or write the data ???
          if(deleteData){
            console.log('deletedata');
            this.deleteData(influxDB,org,bucket,measurementType,location)
              .then(async () => {
                console.log('\nSuppression des données');
                resolve({"data" : 'Suppression des données réalisée'});
              })
              .catch((error) => {
                console.error(error);
                reject(new Error('Suppression des données non réalisée'));
                // console.log('\nFinished ERROR')
              });
          } else if(querySelect) {
            console.log('querySelect');
            await this.queryGenerator(influxDB,querySelect,bucket,measurementType,org).then((result) => {
              console.log('data : ',result);
              resolve({'data' : result})
            }).catch( (e) => {
              console.log(e);
              reject(new Error(e));
            })
          } else {
            console.log('writedata');
            const jsonData = flowData[0].data;

            const tags = this.getTags(data.specificData);

            // every field entered by the user
            const inputFields = [data.specificData.timestamp];
            if(tags.length > 0){
              inputFields.push(...tags);
            }

             // gets the fields that weren't entered by the user
            const fields = this.getRemainingFields(jsonData,inputFields);

            const result = this.writeData(jsonData,influxDB,timestamp,fields,tags,org,bucket,measurementType);
            console.log('donnée insérée ');
            resolve({'data' : result})
          }
        } catch(e) {
        reject(e)
      }
    })
  }

}

module.exports = new InfluxdbConnector()
