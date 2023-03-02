'use strict';

class InfluxdbConnector {
  constructor () {
    this.dotProp = require('dot-prop')
    this.schema = null
    this.modelShema = null
    this.stepNode = false
    this.PromiseOrchestrator = require('../../core/helpers/promiseOrchestrator.js')
    this.ArraySegmentator = require('../../core/helpers/ArraySegmentator.js')
    this.stringReplacer = require('../utils/stringReplacer.js'),
    this.ObjectID = require('bson').ObjectID
  }

      /* TODO :
    - gérer le fait que les variables ne doivent pas commencer par "_" ou "time"
    - gérer fait que strings soient entourées d'un " " pour les fieldset
    - fieldset, measurement obligatoire
    - si timestamp non fourni, timestamp du serveur fourni ???
    - gestion erreurs try/catch

    - compression gzip requête http post

      PARTI PRIS ->>>
    - on met toutes les variables restantes dans les fieldsets !
    */

  stringDataBuilder(jsonData,data,fieldsetString,tagString) {
    // you should refer to the pages on the influxdb line protocol
    // https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#naming-restrictions

    // tester ce qu'il se passe sans tag entré // avec un seul tag entré

    // const keys = Object.keys(jsonData);
    // const values = Object.values(jsonData)
    // console.log("keys : ",keys);
    // console.log("values : ",values);

    // influxdb data type = string
    const measurementName = data.measurement;

    //const fieldSet = "acpowerphase=" + jsonData.acpowerphase ;
    const fieldSet = fieldsetString;
    // the timestamp needs to be in the ISO format
    // like this : ,               1654940402000, the influxISO format
    //     1677687240000 13
    // has 6 more 0s at the end -> 1422568543702900257 19
    const date = new Date(jsonData[data.timestamp]);
    let timestamp = date.getTime().toString();
    if(timestamp.length < 19){
      const nberOfZerosToAdd = 19 - timestamp.length;
      for (let index = 0; index < nberOfZerosToAdd; index++) {
        timestamp+="0";
      }
    }
    // console.log('time : ',date.getTime());

    const result = measurementName +
    // influxdb data type = string
    // optional
    tagString
    // the blank space separates the measurement
    // name and tag set from the field set
    + " " +
    // "saprevision=" + jsonData.saprevision +
    // "," + "sapdatecode" + jsonData.sapedatecode + ","+
    fieldSet
    + " "+
    timestamp + " "
    // each data is a line separated by a /n
    "\n";
    return result
  }

  fieldsetStringBuilder(jsonData,fields){
    //console.log("fields length : ",fields.length);
    let fieldsetString = '';
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      const field_value = jsonData[field];
      // console.log("field : ",field,"value : ",field_value);
      fieldsetString += (field + "=" + field_value);
      if(index != (fields.length-1)){
        fieldsetString += ","
      }
    }
    // console.log("fitag : ",fieldsetString);
    return fieldsetString
  }

  tagStringBuilder(jsonData,tags){
    let tagString = '';
    for (let index = 0; index < tags.length; index++) {
      const tag = tags[index];
      const tag_value = jsonData[tag];
      // console.log("tag : ",tag,"value : ",tag_value);
      tagString += ("," + tag + "=" + tag_value);
    }
    //console.log("final tagString : ",tagString);
    return tagString

  }

  getRemainingFields(jsonData,currentFields){
    const keys = Object.keys(jsonData);
    const remainingFields = [];
    // console.log("keys : ",keys);
    // console.log("values : ",values);
    for (let index = 0; index < keys.length; index++) {
      const element = jsonData[keys[index]];
      // console.log("index : ",index," | is : ",element);
      // console.log("keys :",keys[index]);
      if(currentFields.includes(keys[index])){
        //nothing happens
      } else {
        remainingFields.push(keys[index]);
      }
    }

    return remainingFields
  }

  setTagData(data){
    const componentConfig = data.specificData;
    let headers=[];
    if (componentConfig.headers != undefined) {
      for (let header of componentConfig.headers) {
        try {
          // console.log('test : ',header.tag);
          headers.push(header.tag);
        } catch (e) {
          if (this.config != undefined && this.config.quietLog != true) {
            console.log(e.message);
          }
        }
      }
    }

    return headers
  }

  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        // console.log("data measurement : ",data.specificData.measurement);
        // console.log("data tagKey : ",data.specificData.tagKey);
        // console.log("data timestamp : ",data.specificData.timestamp);

        const tags = this.setTagData(data);
        // console.log("tags : ",tags);

        if(!(data.specificData.tagKey && data.specificData.measurement)){
          throw new Error("Il faut fournir un champs d'id et le nom de la mesure à minima.");
        }

        // every field entered by the user
        const inputFields = [data.specificData.timestamp];
        if(tags.length != 0){
          inputFields.push(...tags);
        }

        // console.log("inputfi ", inputFields);

        const jsonData = flowData[0].data;
        const fields = this.getRemainingFields(jsonData,inputFields);

        // console.log("remaining strings : ",fields);

        const fieldsetString = this.fieldsetStringBuilder(jsonData,fields);
        console.log("before tagstring");
        const tagString = this.tagStringBuilder(jsonData,tags);
        // console.log("tagstring : ",tagString);

        const result = this.stringDataBuilder(jsonData,data.specificData,fieldsetString,tagString);
        console.log("result : ",result);
        resolve({
          data: result
        })
      } catch (e) {
        reject (e)
      }
    })
  }

}

module.exports = new InfluxdbConnector()
