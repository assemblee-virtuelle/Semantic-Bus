<process-list class="containerV" style="padding:20px">

  <zenTable drag={false} disallownavigation={true} disallowdelete={true}  ref="processZenTable">
    <yield to="header">
      <div class="table-title"style="margin-left: 50px;width: 100px;flex-grow:1">Date</div>
      <div class="table-title"style="width: 100px;flex-grow:2">Heure</div>
      <div class="table-title"style="margin-right: 60px;width: 500px;flex-grow:3">Etat</div>
    </yield>
    <yield to="row">
      <div style="width: 100px;flex-grow:1" >{new Date(timeStamp).toLocaleDateString()}</div>
      <div style="width: 100px;flex-grow:2" >{new Date(timeStamp).toLocaleTimeString()}</div>
      <div style="width: 500px;flex-grow:3">
        <progress max={steps.length}  value={stepFinished} class={status}></progress>
      </div>
    </yield>
  </zenTable>

    <!-- <div class="commandButtonImage" style="flex-basis:40px">
      <img src="./image/working.gif" width="40px" if={workInProgress}>
    </div> -->

  <script>
    this.workspaceCurrentProcesChanged=processCollection=>{
      console.log("load process", processCollection)
      this.refs.processZenTable.data=processCollection;
      this.update();
    };


    this.on('mount', function () {
      this.refs.processZenTable.on('rowsSelected',records=>{
        selected=records[0];
        console.log(selected);
        RiotControl.trigger('workspace_current_process_select',selected);

      });
      RiotControl.on('workspace_current_process_changed', this.workspaceCurrentProcesChanged);
      RiotControl.trigger('workspace_current_process_refresh');
    })
    this.on('unmount', function () {
      //RiotControl.off("store_share_workspace",this.share);
      RiotControl.off('workspace_current_process_changed', this.workspaceCurrentProcesChanged);
    })
  </script>
  <style scoped>

  progress {
    width: 100%;

    background: white;
  }
  progress::-webkit-progress-bar {
    /*background: transparent;*/
    /*border-radius: 12px;*/
    background: white;
    /*box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4), 0 2px 5px 0px rgba(0,0,0,0.3);*/

  }
  progress.waiting::-webkit-progress-value {
    /*border-radius: 12px;*/
    background: #ffcf86;
    /*box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4), 0 2px 5px 0px rgba(0,0,0,0.3);*/
  }
  progress.resolved::-webkit-progress-value {
    background: rgb(41,171,135);
  }
  progress.error::-webkit-progress-value {
    background:  #fe4a49;
  }
  progress.waiting::-moz-progress-bar {
    /*border-radius: 5px;*/
    background: #ffcf86;
    /*box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4), 0 2px 5px 0 rgba(0,0,0,0.3);*/
  }
  progress.resolved::-moz-progress-bar {
    background: rgb(41,171,135);
  }
  progress.error::-moz-progress-bar {
    background: #fe4a49;
  }

  </style>
</process-list>
