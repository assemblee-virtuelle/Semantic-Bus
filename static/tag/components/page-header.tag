<page-header class="containerH" style="flex-wrap:nowrap;flex-grow:1">
  <div class="commandBar containerH header">
    <div></div>
    <hgroup>
      <h1>{opts.mainTitle}</h1>
      <h2>{opts.subTitle}</h2>
    </hgroup>

    <div class="actions">
      <button-icon
        each={ opts.actions }
        type="primary"
        state="normal"
        icon="{ icon }"
        label="{ label }"
        onaction={ action }
      ></button-icon>
    </div>
  </div>

  <style>
    .header {
      flex-grow: 1;
    }

    hgroup {
      display: flex;
      flex-direction: column-reverse;
      justify-content: flex-end;
    }

    hgroup h1, hgroup h2 {
      margin: 0;
      padding: 0;
      font-weight: normal;
      text-align: center;
    }

    hgroup h1 {
      font-size: 25pt;
    }

    hgroup h2 {
      font-size: 1.2rem;
    }

    .actions {
      display: flex;
      flex-shrink: 0;
    }
  </style>
</page-header>