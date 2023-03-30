'use strict';

class InfluxdbConnector {
  constructor () {
    this.config = require('../configuration.js');
    this.influxdbClient = require('@influxdata/influxdb-client');
  }

    /* TODO :
    - gérer les types : strings ou api influx (integer only?)
    - sécuriser clé api dans grappe?

    optimisation :
    - batchs de 5000 lignes
    - ordonner les tags par clé ordre lexicographique
    - compression gzip requête http post -> créer composant gzip 
  */

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

  tagStringBuilder(jsonData,tags){
    let tagString = '';
    for (let index = 0; index < tags.length; index++) {
      const tag = tags[index];
      const tag_value = jsonData[tag];
      tagString += ("," + tag + "=" + tag_value);
    }
    return tagString
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
  buildTagData(data){
    let tags=[];
    if (data.tags != undefined) {
      for (let tag of data.tags) {
        try {
          tags.push(tag.tag);
        } catch (e) {
          if (this.config != undefined && this.config.quietLog != true) {
            console.log(e.message);
          }
        }
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
      const tags = this.buildTagData(data.specificData);

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
          if(!(data.specificData && data.specificData.measurement && data.specificData.timestamp)){
            reject(new Error("Il faut fournir le nom de la mesure ou du timestamp"))
          }

          const url = data.specificData.url;
          const token = data.specificData.apiKey;
          const org = data.specificData.organization;
          const bucket = data.specificData.bucket;

          const influxDB = new this.influxdbClient.InfluxDB({url, token});
          const writeApi = influxDB.getWriteApi(org, bucket);
          const jsonData = flowData[0].data;

          const measurementType = data.specificData.measurement;
          const date = new Date(jsonData[data.specificData.timestamp]);

          const tags = this.buildTagData(data.specificData);
          let insertData = true;
          // checking that the data for the tags isn't empty or undefined
          tags.forEach(tag => {
            if(!(jsonData[tag])){
              insertData = false;
            }
          })

          // every field entered by the user
          const inputFields = [data.specificData.timestamp];
          if(tags.length != 0){
            inputFields.push(...tags);
          }

          const fields = this.getRemainingFields(jsonData,inputFields);
          
          if(!(fields.length > 0)){
            reject(new Error("Il faut qu'il y ait au moins un champs en entrée (field)."))
          }
          else if(date.toString().toLowerCase() === "invalid date"){
            reject(new Error("Il faut fournir un timestamp et des données valides dans les tags."))
          } 
          else if(insertData){
            // if we have valid tag values,
            // a valid timestamp and at least one field then
            // we insert the data
            const point1 = new this.influxdbClient.Point(measurementType)
                          .timestamp(date)
            const point2 = this.addTagsToPoint(jsonData,point1,tags)
            const point3 = this.addFieldsToPoint(jsonData,point2,fields);
            writeApi.writePoint(point3);

            try {
              await writeApi.close();
              resolve({"data" : 'Donnée insérée'});
            } catch (e) {
              console.error(e);
              if (e instanceof HttpError && e.statusCode === 401) {
                console.log('Run ./onboarding.js to setup a new InfluxDB database.');
                reject(e)
              }
              console.log('\nTerminé avec des erreurs');
              reject(e)
            }
          } else{
            resolve({'data':'Donnée non insérée'});
          }
          resolve({'data':'Donnée non insérée'});

        } catch(e) {
        reject(e)
      }
    })
  }

}

module.exports = new InfluxdbConnector()
