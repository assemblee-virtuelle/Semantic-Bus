<headerTag class="containerV" style="align-items:stretch;background-color: rgb(240,240,240);
    padding: 10pt;">
  <div class="commandBar containerH commandBarTable" style={opts.css}>
    <div></div>
    <div>{opts.title}</div>
    <div class="containerH commandGroup">
      <div onclick={addRowClick} class="commandButtonImage test-addRow" if={!opts.disallowcommand==true}><img src="./image/Super-Mono-png/PNG/basic/blue/toggle-expand-alt.png" height="40px"></div>
      <div onclick={delRowClick} class="commandButtonImage test-delRow" if={!opts.disallowcommand==true}><img src="./image/Super-Mono-png/PNG/basic/blue/toggle-collapse-alt.png" height="40px"></div>
      <div onclick={cancelClick} class="commandButton" if={opts.allowcancelcommand==true}>cancel</div>
      <div onclick={actionClick} class="commandButton" if={opts.actiontext!=undefined}>{opts.actiontext}</div>
    </div>
  </div>
<headerTag/>