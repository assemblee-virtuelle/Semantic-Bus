<!--
* label: string
* for: string
-->
<ds-field>
  <label for={ opts.for }>{ opts.label }</label>
  <div class="input-container">
    <yield />
  </div>

  <style>
    label {
      display: block;
      font-size: 0.75em;
      text-transform: uppercase;
    }

    .input-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 9vh;
      margin-left: 1vw;
    }
  </style>

  <script>
    this.on('mount', () => {
      if (this.opts.label === undefined) console.error('attribute label is required')
      if (this.opts.for === undefined) console.error('attribute for is required')
    })
  </script>
</ds-field>