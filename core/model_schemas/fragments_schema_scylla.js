  const { v4: uuidv4 } = require('uuid');

class Fragment {
  constructor(data) {
    // Normaliser les propriétés de data
    const lowerCamelData = {
      id: data?.id ,
      data: data?.data ,
      originFrag:  data?.originfrag || data?.originFrag,
      rootFrag: data?.rootfrag || data?.rootFrag,
      branchOriginFrag: data?.branchoriginfrag || data?.branchOriginFrag,
      branchFrag: data?.branchfrag || data?.branchFrag,
      garbageTag: data?.garbagetag || data?.garbageTag,
      garbageProcess: data?.garbageprocess || data?.garbageProcess,
    };

    // console.log('____constructor Fragment-1', lowerCamelData);
    // console.log('____constructor Fragment-1.0.rootFrag',lowerCamelData?.rootFrag);
    // console.log('____constructor Fragment-1.1.rootFrag',lowerCamelData?.rootFrag?.buffer);
    // console.log('____constructor Fragment-1.2.rootFrag',lowerCamelData?.rootFrag?.buffer ? lowerCamelData.rootFrag.buffer.toString() : undefined);
    this.id = lowerCamelData.id || uuidv4();
    this.data = lowerCamelData.data;
    this.originFrag = lowerCamelData.originFrag;
    this.rootFrag = lowerCamelData.rootFrag;
    this.branchOriginFrag =  lowerCamelData.branchOriginFrag;
    this.branchFrag =  lowerCamelData.branchFrag;
    this.garbageTag = lowerCamelData.garbageTag;
    this.garbageProcess = lowerCamelData.garbageProcess;
    // console.log('____constructor Fragment-2', this);
  } 
} 

module.exports = Fragment;
