<admin class="containerV" style="flex-grow:1">

  <div class="containerH" style="justify-content:center">
    <div class="containerV">
      <label class="labelFormStandard">Nettoyer les données de fragmentation</label>
        <div onclick={cleanFragClick} class="btnFil commandButtonImage">
          Nettoyer
          <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer fragmentation">
          <input ref="import" type="file" style="display:none;"/>
        </div>
    </div>
  </div>
  <div class="containerH" style="justify-content:center">
    <div class="containerV">
      <label class="labelFormStandard">Nettoyer les processus d'execution</label>
        <div onclick={cleanProcessClick} class="btnFil commandButtonImage">
          Nettoyer
          <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer fragmentation">
          <input ref="import" type="file" style="display:none;"/>
        </div>
    </div>
  </div>


  <script>
    this.data = {}

    this.refreshData = (data) => {
      this.data = data
      this.update()
    }

    cleanFragClick(e){
      RiotControl.trigger('clean_fragment');
    }

    cleanProcessClick(e){
      RiotControl.trigger('clean_process');
    }

    fragmentCleaned(){
      alert('fragments néttoyés');
    }

    processCleaned(){
      alert('processus néttoyés');
    }



    this.on('mount', () => {
      RiotControl.on('fragment_cleaned', this.fragmentCleaned);
      RiotControl.on('process_cleaned', this.processCleaned);
      // RiotControl.trigger('workspace_collection_load');
    })

    this.on('unmount', () => {
      RiotControl.off('fragment_cleaned', this.fragmentCleaned)
      RiotControl.off('process_cleaned', this.processCleaned)
    })
  </script>
  <style>

  .btnFil {
    justify-content: space-evenly;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: solid;
    border-width: 1px;
    border-radius: 2px;
    width: 15vw;
    height: 5vh;
    color: rgb(26,145,194);
  }
  .imgFil {
    width: 3vh;
    height: 3vh
  }

  </style>
</admin>
