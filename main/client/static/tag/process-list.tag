<process-list class="containerV" style="padding:20px">

  <zenTable drag={false} disallownavigation={true} disallowdelete={true}  ref="processZenTable">
    <yield to="header">
      <div class="containerTitle">
        <div class="tableTitleDate">Date</div>
        <div class="tableTitleHoure">Heure</div>
        <div class="tableTitleState">Etat</div>
        <div class="tableEmpty"/>
      </div>
    </yield>
    <yield to="row">
      <div class="tableRowDate">{renderDate(timeStamp)}</div>
      <div class="tableRowHoure">{new Date(timeStamp).toLocaleTimeString()}</div>
      <div class="tableRowState">
        <progress max={steps.length}  value={stepFinished} class={status}></progress>
      </div>
      <div class="tableRowStateName">{status}</div>
    </yield>
  </zenTable>

  <script>
    renderDate = (date) => (
      `${new Date(date).getDate()} ${['janv.',
        'févr.',
        'mars',
        'avr.',
        'mai',
        'juin',
        'juil.',
        'août',
        'sept.',
        'oct.',
        'nov.',
        'dec.'][new Date(date).getMonth()]} ${new Date(date).getFullYear()}`
    ) 
    this.workspaceCurrentProcesChanged=processCollection=>{
      processCollection.map((process)=>{
        if(process.state == "stop") process.status ="stoped"
      })
      this.refs.processZenTable.data=processCollection;
      this.update();
    };

    this.on('mount', function () {
      this.refs.processZenTable.on('rowsSelected',records=>{
        selected=records[0];
        RiotControl.trigger('workspace_current_process_select',selected);
      });
      RiotControl.on('workspace_current_process_changed', this.workspaceCurrentProcesChanged);
      RiotControl.trigger('workspace_current_process_refresh_from_server');
    })
    this.on('unmount', function () {
      RiotControl.off('workspace_current_process_changed', this.workspaceCurrentProcesChanged);
    })
  </script>
  <style scoped>

    .containerTitle {
      border-radius: 2px;
      width: 90%;
      flex-direction: row;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgb(26,145,194);
    }
    .tableTitleDate {
      font-size: 0.85em;
      flex:0.17;
      color: white;
      padding-left:10px;
    }
    .tableTitleHoure {
      font-size: 0.85em;
      flex:0.17;
      color: white;
      padding-left:10px;
    }
    .tableTitleState {
      font-size: 0.85em;
      flex:0.51;
      color: white;
      padding-left:10px;
    }
    .tableEmpty {
      flex:0.15;
    }
    .tableRowDate {
      font-size: 0.85em;
      flex:0.2;
      padding: 10px;
    }
    .tableRowHoure {
      font-size: 0.85em;
      flex:0.2;
      padding: 10px;
    }
    .tableRowState {
      font-size: 0.85em;
      flex:0.4;
      padding: 10px;
    }
    .tableRowStateName {
      font-size: 0.85em;
      font-family: 'Open Sans', sans-serif;
      font-weight: 200;
      flex:0.2;
      padding: 10px;
      text-align: center;
      text-transform: uppercase;
    }
    progress {
      width: 100%;
      background: rgb(230,230,230);
    }
    progress::-webkit-progress-bar {
      /*background: transparent;*/
      /*border-radius: 12px;*/
      background: rgb(230,230,230);
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
    progress.processing::-webkit-progress-value {
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
    progress.stoped::-webkit-progress-value {
      background: #fe4a49;
    }
    progress.stoped::-moz-progress-bar {
      background: #fe4a49;
    }
    progress.error::-moz-progress-bar {
      background: #fe4a49;
    }

  </style>
</process-list>
