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
    :scope {
      display: block;
    }

    label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      margin-top: 0;
      margin-bottom: 5px;
    }

    .input-container {
      display: flex;
      margin-left: 20px;
    }
  </style>

  <script>
    this.on('mount', () => {
      if (this.opts.label === undefined) console.error('attribute label is required')
      if (this.opts.for === undefined) console.error('attribute for is required')
    })
  </script>
</ds-field>