'use strict';
const fragmentModel = require('../models/fragment_model');
const PromiseOrchestrator = require('../helpers/promiseOrchestrator.js');
const ArraySegmentator = require('../helpers/ArraySegmentator.js');
const Error = require('../helpers/error.js');
const objectSizeOf = require("object-sizeof");

class Fragment {
  frag(frag, key) {
    return new Promise(async (resolve, reject) => {
      if (Array.isArray(frag.data)) {
        if (objectSizeOf(frag.data) > 1000) {
          
          const promiseOrchestrator = new PromiseOrchestrator();
          const arraySegmentator = new ArraySegmentator();
          const segmentation = arraySegmentator.segment(frag.data, 100)
          
          const paramArray = segmentation.map(s => {
            return [s.map(r=>{return {data:r}}), true]
          })

          const persistSegments = await promiseOrchestrator.execute(this, persist, paramArray, {  beamNb: 10 })
          const arrayOut = [];
          const allFrags = [];
                  
          persistSegments.forEach(persistSegment => {
            if(persistSegment != undefined){  
              if(persistSegment.error!=undefined){
                arrayOut.push(persistSegment);
              } else {
                persistSegment.forEach(persistRecord => {
                  
                  if (persistRecord._id != undefined) {
                    
                    arrayOut.push({
                      _frag: persistRecord._id
                    });
                    allFrags = allFrags.concat([persistRecord._id]);
                  } else {
                    arrayOut.push(persistRecord.data);
                  }
                  if (persistRecord.frags != undefined) {
                    allFrags = allFrags.concat(persistRecord.frags);
                  }
                });
              }
            }
          });

          resolve({
            frag: {
              data: arrayOut,
              frags: allFrags,
              _id: frag._id
            },
            key: key
          });

        } else {
            
          resolve({
            frag: {
              data: frag.data,
              frags: [],
              _id: frag._id
            },
            key: key
          });
        }

      } else if (frag.data instanceof Object && key != '_id' && key != '_frag') {
        
        const promiseStack = [];
        const objectOut = {};
        let frags;
        for (let key in frag.data) {
          promiseStack.push(frag({
            data: frag.data[key]
          }, key));
        }
        try {
          frags = await Promise.all(promiseStack)
        } catch(e) {
          return reject(new Error.InternalProcessError(e))
        }
        const allFrags = [];
          
        frags.forEach(fragAndKey => {
          objectOut[fragAndKey.key] = fragAndKey.frag.data;
          if (fragAndKey.frag.frags != undefined) {
            allFrags = allFrags.concat(fragAndKey.frag.frags);
          }
        });
          
        resolve({
          frag: {
            data: objectOut,
            frags: allFrags,
            _id: frag._id
          },
          key: key
        });

      } else {
        
        resolve({
          frag: {
            data: frag.data,
            _id: frag._id
          },
          key: key
        });
      }
    })
  };
  persist(datas, createOnly) {
    return new Promise(async (resolve, reject) => {
      if (datas instanceof Object) {
        let fragReadyPromises = [];
        let fragReadyFargs = [];

        if (!Array.isArray(datas)) {
          datas = [datas];
          forceArray = true;
        }
        fragReadyPromises = datas.map(data => {
          if (createOnly == true || data._id==undefined) {
            return new Promise((resolve, reject) => {
              resolve({
                data: data.data
              })
            })
          } else {
            return new Promise(async (resolve, reject) => {
              try {
                const fragment = fragmentModel.getInstance().model.findOne({_id: data._id}).lean().exec();
                if(fragment) {
                    fragmentfragmentModel.getInstance().model.remove({_id: { $in: fragment.frags}}).exec();
                    fragment.data = data.data;
                  } else {
                    fragment = {
                      data: data.data
                    }
                  }
                resolve(fragment);
              } catch(e) {
                return reject(new Error.DataBaseProcessError(e))
              }
            });
          }
        });
        
        try {
          fragReadyFargs = await Promise.all(fragReadyPromises)
        } catch (e) {
          return reject(e)
        }

        const persistReadyPromises = fragReadyFargs.map(f => {
          return frag(f)
        });
        
                    
        try {
          persistReadyFargs = await Promise.all(persistReadyPromises)
        } catch (e) {
          return reject(e)
        }
        
        const createReadyFrags = [];
        const updateReadyFrags = [];

        let insertedAndUpdatedFrags;

        persistReadyFargs.forEach(persistReadyFarg => {
          if (persistReadyFarg.frag.data instanceof Object) {
            if (persistReadyFarg.frag._id == undefined) {
              const fragmentModelInstance= fragmentModel.getInstance().model;
              createReadyFrags.push(new fragmentModelInstance(persistReadyFarg.frag));
            } else{
              updateReadyFrags.push(persistReadyFarg.frag);
            }
          }
        })
        
        const insertPromiseStack = fragmentModel.getInstance().model.insertMany(createReadyFrags, {
          new: true
        });

        const updatePromisesStack = updateReadyFrags.map(f => {
          return fragmentModel.getInstance().model.findOneAndUpdate({
            _id: f._id
          }, f, {
            upsert: true,
            new: true
          }).lean().exec();
        })

        try {
          insertedAndUpdatedFrags = await Promise.all([insertPromiseStack, updatePromisesStack ]);
        } catch (e) {
          return reject(new Error.DataBaseProcessError(e))
        }
        
        let out = insertedAndUpdatedFrags[0].concat(insertedAndUpdatedFrags[1]).concat(insertedAndUpdatedFrags[2]);
        if (forceArray) {
          out = out[0];
        }

        return resolve(out);
      } else {
        resolve(datas);
      }
    })
  };
  get(id) {
    return new Promise((resolve, reject) => {
        fragmentModel.getInstance().model.findOne({
          _id: id
        })
        .lean()
        .exec()
        .then((fragmentReturn) => {
          resolve(fragmentReturn)
        }).catch(err => {
          return reject(new Error.DataBaseProcessError(err))
        });
      });
  };
  getWithResolution(id) {
    
    return new Promise(async (resolve, reject) => {
  
      
      let fragmentReturn; 
      try {
        fragmentReturn = await fragmentModel.getInstance().model.findOne({_id: id}).lean().exec()
      } catch (e) {
        return reject(new Error.DataBaseProcessError(e))
      }

      if (fragmentReturn != null) {
        try {
          framentParts = await fragmentModel.getInstance().model.find({_id: { $in: fragmentReturn.frags}}).lean().exec()
        } catch (e) {
          return reject(new Error.DataBaseProcessError(e))
        }
      } else {
        resolve(null)
      }

      const partDirectory = {};

      framentParts.forEach(frag => {
        partDirectory[frag._id] = frag.data;
      });
      
      const resolution = rebuildFrag(fragmentReturn.data, partDirectory);
      fragmentReturn.data = resolution;
      resolve(fragmentReturn);

    })
  };
  rebuildFrag(object, partDirectory) {
    if (object instanceof Object && object != null && object != undefined) {
      for (let key in object) {
        if (key != '_id') {
          if (object[key] != null && object[key] != undefined && object[key]['_frag'] != undefined) {
            object[key] = rebuildFrag(partDirectory[object[key]['_frag']], partDirectory);
          } else {
            object[key] = rebuildFrag(object[key], partDirectory);
          }
        }
      }
    }
    return object;
  };
  cleanFrag(id) {
    
    fragmentModel.getInstance().model.findOne({
      _id: id
    })
    .lean()
    .exec()
    .then(frag => {
      
      if (frag != null) {
        let fragsToDelete = frag.frags;
        fragsToDelete.push(frag._id);
        fragmentModel.getInstance().model.remove({
          _id: {
            $in: fragsToDelete
          }
        }).exec();
      }
    })
  }
};


module.exports = new Fragment()