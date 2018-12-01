<workspace-left-menu>
  <workspace-left-menu-item
    label="Editer"
    tooltip="Editer le graph"
    href={ '#workspace/' + opts.workspace_id + '/component' }
    icon="./image/menu/graph.png"
    active={ opts.menu == 'component' }
    if={ opts.mode == "edit" }
  ></workspace-left-menu-item>

  <workspace-left-menu-item
    label="Partager"
    tooltip="Partager le Workflow"
    href={ '#workspace/' + opts.workspace_id + '/user' }
    icon="./image/menu/share.png"
    active={ opts.menu == 'user' }
    if={ opts.mode == "edit" }
  ></workspace-left-menu-item>

  <workspace-left-menu-item
    label="Paramétrer"
    tooltip="Paramétrer le Workflow"
    href={ '#workspace/' + opts.workspace_id + '/information' }
    icon="./image/menu/tools.png"
    active={ opts.menu == 'information' }
  ></workspace-left-menu-item>

  <workspace-left-menu-item
    label="Superviser"
    tooltip="Superviser la consommation"
    href={ '#workspace/' + opts.workspace_id + '/running' }
    icon="./image/menu/chart.png"
    active={ opts.menu == 'running' }
    if={ opts.mode == "edit" }
  ></workspace-left-menu-item>

  <workspace-left-menu-item
    label="Exécuter"
    tooltip="Exécuter un processus"
    href={ '#workspace/' + opts.workspace_id + '/process' }
    icon="./image/menu/inbox.png"
    active={ opts.menu == 'process' }
    if={ opts.mode == "edit" }
  ></workspace-left-menu-item>

  <style>
    :scope {
      display: flex;
      flex-direction: column;
      flex-basis: 80px;
      flex-shrink: 0;
      background-color: rgb(124, 195, 232);
    }
  </style>
</workspace-left-menu>