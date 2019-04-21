<!--
* label: string
* id: string
* value?: number
* onupdate?: (event: { value: number }) => void // required when readonly is not true
* readonly?: boolean
* placeholder?: string
-->
<ds-input-integer>
  <ds-field for={ `${this.opts.id}-field` } label={ opts.label }>
    <input
      type="number"
      id={ `${this.parent.opts.id}-field` }
      value={ parent.opts.riotValue }
      oninput={parent.onChange}
      readonly={parent.opts.readonly}
      placeholder={parent.opts.placeholder}
    />
  </ds-field>

  <style>
    :scope {
      display: block;
    }

    input {
      width: 100%;
      border: rgb(212, 212, 212) 1px solid;
      padding: 8px;
      color: rgb(161, 161, 161);
      font-size: 1em;
      border-radius: 2px;
    }
  </style>

  <script>
    this.on('mount', () => {
      if (this.opts.label === undefined) console.error('attribute label is required')
      if (this.opts.id === undefined) console.error('attribute id is required')
      if (this.opts.onupdate === undefined && !this.opts.readonly) console.error('attribute onupdate is required when field is not readonly')
    })

    onChange(event) {
      this.opts.onupdate({value: parseInt(event.currentTarget.value)})
    }
  </script>
</ds-input-integer>