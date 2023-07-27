'use strict'
class GouvFrGeoLocaliser {
  constructor() {
  }

  initComponent(entity) {
    return entity
  }

  async geoLocalise2(flowData, specificData) {
      try {
        if (flowData==undefined){
          throw new Error("input data have to exist")
        }
        if(Array.isArray(flowData)){
          throw new Error('input data can not be an array');
        }
        if(typeof flowData === 'string' || flowData instanceof String){
          throw new Error('input data have to be an object');
        }
        var address = {
          street: flowData[specificData.streetPath],
          town: flowData[specificData.townPath],
          postalCode: flowData[specificData.postalCodePath],
          country: flowData[specificData.countryPath]
        }
        let adressArray = [];
        if(address.street){
          adressArray.push(address.street);
        }
        if(address.postalCode){
          adressArray.push(address.postalCode);
        }
        if(address.town){
          adressArray.push(address.town);
        }
        if(address.country){
          adressArray.push(address.country);
        }
        var addressGouvFrFormated = adressArray.join(',');
        const geoResponse = await fetch(`http://api-adresse.data.gouv.fr/search/?q=${addressGouvFrFormated}`);
        const geoResponseObject = await geoResponse.json();
        flowData[specificData.latitudePath] = geoResponseObject.features[0].geometry.coordinates[1];
        flowData[specificData.longitudePath] = geoResponseObject.features[0].geometry.coordinates[0];
        
        // console.log(flowData)
        return {
          data: flowData
        };
      } catch (e) {
        console.error(e);
        throw e
      }

  }

  pull(data, flowData) {
    // console.log('flowData',flowData[0])
    return this.geoLocalise2(flowData?flowData[0].data:undefined, data.specificData)
  }
}

module.exports = new GouvFrGeoLocaliser()
