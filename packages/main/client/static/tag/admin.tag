<admin class="containerV" style="flex-grow:1">


  <label class="labelFormStandard">supprimer les fragments marqués</label>
  <div onclick={cleanGarbageSimpleClick} class="btnFil commandButtonImage">
    Nettoyer (fragments)
    <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer les fragments">
    <input ref="import" type="file" style="display:none;"/>
  </div>

  <label class="labelFormStandard">Suprimer les processus d'execution périmés + marquer les fragments à supprimer + supprimer les fragments marqués</label>
  <div onclick={cleanProcessClick} class="btnFil commandButtonImage">
    Nettoyer (processus + fragments)
    <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer process et les fragments associés">
    <input ref="import" type="file" style="display:none;"/>
  </div>

  <label class="labelFormStandard">Supprimer les fragments marqués à supprimer + Supprimer brutalement (algo independant) les fragments des processus périmés + supprimer les processus d'execution périmés</label>
  <div onclick={cleanGarbageClick} class="btnFil commandButtonImage">
    Nettoyer (Brut)
    <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer les fragments périmées">
    <input ref="import" type="file" style="display:none;"/>
  </div>


  <label class="labelFormStandard">Executer tous les timers</label>
  <div onclick={executeTimersClick} class="btnFil commandButtonImage">
    Executer
    <img class="imgFil" src="./image/Administrative-Tools-256.png" title="executer timers">
    <input ref="import" type="file" style="display:none;"/>
  </div>

  <script>
    this.data = {}

    this.refreshData = (data) => {
      this.data = data
      this.update()
    }

    cleanGarbageClick(e) {
      RiotControl.trigger('clean_garbage');
    }

    cleanProcessClick(e) {
      RiotControl.trigger('clean_process');
    }

    cleanGarbageSimpleClick(e) {
      RiotControl.trigger('clean_garbage_simple');
    }

    executeTimersClick(e) {
      RiotControl.trigger('execute_timers');
    }

    garbageCleaned() {
      alert('données perimées néttoyés');
    }

    processCleaned() {
      alert('processus néttoyés');
    }

    timersExecuted() {
      alert('timers executés');
    }

    this.on('mount', () => {
      RiotControl.on('garbage_cleaned', this.garbageCleaned);
      RiotControl.on('process_cleaned', this.processCleaned);
      RiotControl.on('timers_executed', this.timersExecuted);
      // RiotControl.trigger('workspace_collection_load');
    })

    this.on('unmount', () => {
      RiotControl.off('garbage_cleaned', this.garbageCleaned)
      RiotControl.off('process_cleaned', this.processCleaned)
      RiotControl.off('timers_executed', this.timersExecuted);
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
      height: 3vh;
    }
  </style>
</admin>
