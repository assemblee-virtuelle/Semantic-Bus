<workspace-left-menu-item>
  <a href={opts.href}>
    <img src={opts.icon} alt={opts.tooltip} title={opts.tooltip}>
    <p>{opts.label}</p>
    <div class="arrow-left"></div>
  </a>

  <style>
    :scope {
      flex-basis: 100px;
      flex-grow: 0;
      transition: all 250ms ease-in-out;
    }

    :scope:hover, :scope[active] {
      background-color: rgb(137, 208, 245);
    }

    a {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      width: 100%;
      height: 100%;

      position: relative;

      font-family: 'Open Sans', sans-serif;
      color: white;
      font-size: 10px;

      cursor: pointer;
    }

    img {
      width: 40px;
      height: 40px;
    }

    .arrow-left {
      position: absolute;
      top: calc(50% - 10px);
      right: 0;
    }

    :scope:not([active]) .arrow-left {
      display: none;
    }
  </style>
</workspace-left-menu-item>