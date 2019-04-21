<!--
# Attributes

* label: string
* id: string
* value?: string
* onupdate?: (event: { value: string }) => void // required when readonly is not true
* readonly?: boolean
* placeholder?: string

-->
<ds-input-text>
  <label for={ `${this.opts.id}-field` }>{ opts.label }</label>
  <div class="input-container">
    <input
      type="text"
      id={ `${this.opts.id}-field` }
      value={ this.opts.riotValue }
      oninput={onChange}
      readonly={opts.readonly}
      placeholder={opts.placeholder}
    />
  </div>

  <style>
    label {
      display: block;
      font-size: 0.75em;
      text-transform: uppercase;
    }

    input {
      width: 100%;
      border: rgb(212, 212, 212) 1px solid;
      padding: 8px;
      color: rgb(161, 161, 161);
      font-size: 1em;
      border-radius: 2px;
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
      if (this.opts.id === undefined) console.error('attribute id is required')
      if (this.opts.onupdate === undefined && !this.opts.readonly) console.error('attribute onupdate is required when field is not readonly')
    })

    onChange(event)
    {
      this.opts.onupdate({value: event.currentTarget.value})
    }
  </script>
</ds-input-text>