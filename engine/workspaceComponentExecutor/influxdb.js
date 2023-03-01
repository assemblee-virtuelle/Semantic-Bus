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

  stringDataBuilder(jsonData) {
    // you should refer to the pages on the influxdb line protocol
    // https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/#naming-restrictions

    /* TODO :
    - gérer le fait que les variables ne doivent pas commencer par "_" ou "time"
    - gérer fait que strings soient entourées d'un " " pour les fieldset
    - fieldset, measurement obligatoire
    - si timestamp non fourni, timestamp du serveur fourni ???
    - vérifier pour le temps pour ajouter les 6 zeros en plus

    - compression gzip requête http post
    */

    const keys = Object.keys(jsonData);
    const values = Object.values(jsonData)
    console.log("keys : ",keys);
    console.log("values : ",values);

    // influxdb data type = string
    const measurementName = "electricitySensors";

    // influxdb data type = string
    // optional
    const tagKeys = 'sensor_id=' + jsonData.sappartnumber;

    // influxdb data type = string,float,integer,UInteger,String,Boolean
    //
    const fieldSet = "acpowerphase=" + jsonData.acpowerphase ;

    // the timestamp needs to be in the ISO format
    // like this : ,               1654940402000, the influxISO format
    // has 6 more 0s at the end -> 1422568543702900257
    const date = new Date(jsonData.datetime);
    let timestamp = date.getTime().toString();
    console.log("timestamp length : ",timestamp.length);
    if(timestamp.length < 19){
      const nberOfZerosToAdd = 19 - timestamp.length;

      console.log("nber zeros to add : ",nberOfZerosToAdd);

      for (let index = 0; index < nberOfZerosToAdd; index++) {
        timestamp+="0";
      }
      //timestamp += "000000";
    }
    //console.log("isodate",isoDate);

    const result = measurementName + ',' +
    tagKeys
    // the blank space separates the measurement
    // name and tag set from the field set
    + " " +
    // "saprevision=" + jsonData.saprevision +
    // "," + "sapdatecode" + jsonData.sapedatecode + ","+
    fieldSet
    + " "+
    timestamp +
    // each data is a line separated by a /n
    '\n';
    return result
  }

  pull (data, flowData, pullParams) {
    return new Promise((resolve, reject) => {
      try {
        const jsonData = flowData[0].data;
        const result = this.stringDataBuilder(jsonData);

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
