<!--
* label: string
* id: string
* value?: string
* onupdate?: (event: { value: string }) => void // required when readonly is not true
* readonly?: boolean
* placeholder?: string
* maxlength?: number
-->
<ds-input-text>
  <ds-field for={ `${this.opts.id}-field` } label={ opts.label }>
    <input
      type="text"
      id={ `${this.parent.opts.id}-field` }
      value={ parent.opts.riotValue }
      oninput={parent.onChange}
      readonly={parent.opts.readonly}
      placeholder={parent.opts.placeholder}
      maxlength={parent.opts.maxlength}
    />
  </ds-field>

  <style>
    :scope {
      display: block;
    }

    input {
      flex-grow: 1;
      border: rgb(212, 212, 212) 1px solid;
      padding: 8px;
      color: rgb(161, 161, 161);
      font-size: 1rem;
      border-radius: 2px;
    }
  </style>

  <script>
    this.on('mount', () => {
      if (this.opts.label === undefined) console.error('attribute label is required')
      if (this.opts.id === undefined) console.error('attribute id is required')
      if (this.opts.onupdate === undefined && !this.opts.readonly) console.error('attribute onupdate is required when field is not readonly')
      if (this.opts.maxlength !== undefined && typeof this.opts.maxlength !== 'number') console.error('maxlength should be a number')
    })

    onChange(event) {
      this.opts.onupdate({value: event.currentTarget.value})
    }
  </script>
</ds-input-text>