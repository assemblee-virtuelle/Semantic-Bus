<admin class="containerV" style="flex-grow:1">

  <div class="containerH" style="justify-content:center">
    <div class="containerV">
      <label class="labelFormStandard">Nettoyer les données de fragmentation</label>
        <div onclick={cleanClick} class="btnFil commandButtonImage">
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

    cleanClick(e){
      RiotControl.trigger('clean_fragment');
    }

    fragmentCleaned(){
      alert('fragments néttoyés');
    }



    this.on('mount', () => {
      RiotControl.on('fragment_cleaned', this.fragmentCleaned);
      // RiotControl.trigger('workspace_collection_load');
    })

    this.on('unmount', () => {
      RiotControl.off('fragment_cleaned', this.fragmentCleaned)
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
