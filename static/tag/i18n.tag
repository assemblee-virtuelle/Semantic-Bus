<i18n>
  <span ref="message">{message}</span>

  <script>
    this.on('update', () => {
      this.refs.message.innerHTML = window.i18n.translate(this.opts.key, this.opts.format)
    })
  </script>
</i18n>
