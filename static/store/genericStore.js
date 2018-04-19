function GenericStore(utilStore, specificStoreList, stompClient) {


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  riot.observable(this) // Riot provides our event emitter.
  for (specificStore of specificStoreList) {
    specificStore.genericStore = this;
  }


  this.workspaceBusiness = new WorkspaceBusiness();
  this.workspaceCurrent;
  this.itemCurrent;
  this.connectMode;

  this.modeConnectBefore = false;
  this.modeConnectAfter = false;
  this.stompClient=stompClient;
  this.utilStore= utilStore


  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------


  // ----------------------------------------- FUNCTION  -----------------------------------------









  // --------------------------------------------------------------------------------
}
