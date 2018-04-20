<process-list class="containerV">

  <zenTable drag={false} disallownavigation={true}  ref="processZenTable">
    <yield to="header">
      <div style="width:200px">date</div>
      <div style="width:200px">heure</div>
      <div style="width:100%">etat</div>
    </yield>
    <yield to="row">
      <div style="width:200px" >{new Date(timeStamp).toLocaleDateString()}</div>
      <div style="width:200px" >{new Date(timeStamp).toLocaleTimeString()}</div>
      <div style="width:100%">
        <progress max={steps.length}  value={stepFinished} class={status}></progress>
      </div>
    </yield>
  </zenTable>

    <!-- <div class="commandButtonImage" style="flex-basis:40px">
      <img src="./image/working.gif" width="40px" if={workInProgress}>
    </div> -->

  <script>
    this.workspaceCurrentProcesChanged=processCollection=>{
      //console.log('ALLO');
      //this.processCollection=processCollection;
      console.log(processCollection);
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
    background: orange;
    /*box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4), 0 2px 5px 0px rgba(0,0,0,0.3);*/
  }
  progress.resolved::-webkit-progress-value {
    background: green;
  }
  progress.error::-webkit-progress-value {
    background: red;
  }

  progress.waiting::-moz-progress-bar {
    /*border-radius: 5px;*/
    background: orange;
    /*box-shadow: inset 0 -2px 4px rgba(0,0,0,0.4), 0 2px 5px 0 rgba(0,0,0,0.3);*/
  }
  progress.resolved::-moz-progress-bar {
    background: green;
  }
  progress.error::-moz-progress-bar {
    background: red;
  }

  </style>
</process-list>
