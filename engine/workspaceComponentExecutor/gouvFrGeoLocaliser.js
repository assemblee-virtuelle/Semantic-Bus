'use strict'
class GouvFrGeoLocaliser {
  constructor() {
  }

  initComponent(entity) {
    return entity
  }

  async geoLocalise2(flowData, specificData) {
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
      var addressGouvFrFormated = [address.street, address.postalCode, address.town, address.country].join(',');
      const geoResponse = await fetch(`http://api-adresse.data.gouv.fr/search/?q=${addressGouvFrFormated}`);
      const geoResponseObject = await geoResponse.json();
      flowData[specificData.latitudePath] = geoResponseObject.features[0].geometry.coordinates[1];
      flowData[specificData.longitudePath] = geoResponseObject.features[0].geometry.coordinates[0];

      return {
        data: flowData
      };
  }

  pull(data, flowData) {
    return this.geoLocalise2(flowData[0].data, data.specificData)
  }
}

module.exports = new GouvFrGeoLocaliser()
