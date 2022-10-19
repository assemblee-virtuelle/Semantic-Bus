<admin class="containerV" style="flex-grow:1">


  <label class="labelFormStandard">Nettoyer les processus d'execution périmés / suppression normale</label>
  <div onclick={cleanProcessClick} class="btnFil commandButtonImage">
    Nettoyer
    <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer process">
    <input ref="import" type="file" style="display:none;"/>
  </div>

  <label class="labelFormStandard">Nettoyer les données périmées (processus historique,fragmentation) / suppression brutale</label>
  <div onclick={cleanGarbageClick} class="btnFil commandButtonImage">
    Nettoyer (Brut)
    <img class="imgFil" src="./image/Administrative-Tools-256.png" title="Nettoyer données périmées">
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
