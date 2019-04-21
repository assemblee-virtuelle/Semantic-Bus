<!--
* items: [{code: string, url: string, image: string, label: string}]
* active: string
-->
<ds-horizontal-nav>
  <nav class=" containerH containerNavBarTop">
    <a each={item in opts.items} href={item.url} onclick={click} class="commandButtonImage navBarTop containerV" style={this.backgroundActive(item)}>
      <img src={item.image} height="40px" width="40px">
      {item.label}
      <div if={this.isActive(item)} class="containerH arrow">
        <div class="containerV" style="justify-content:flex-end;">
          <div class="arrow-up"></div>
        </div>
      </div>
    </a>
  </nav>

  <script>
    click(event) {
      const item = event.item.item
      console.log(item)
      if (item.url === undefined && item.action !== undefined) {
        item.action()
      }
    }

    isActive(item) {
      return item.code === this.opts.active
    }

    backgroundActive(item) {
      if(this.isActive(item)) {
        return {"background-color": "rgb(104,175,212)"}
      }
      return {"background-color": "rgb(124,195,232)"}
    }
  </script>
</ds-horizontal-nav>