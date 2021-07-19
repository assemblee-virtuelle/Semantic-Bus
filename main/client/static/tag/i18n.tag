<i18n>
  <script>
    const variablePrefix = 'var'

    this.on('update', () => {
      const translation = window.i18next.t(this.opts.key, getVariables(this.opts))
      if (this.opts.raw) {
        this.root.innerHTML = translation
      } else {
        this.root.textContent = translation
      }

    })

    const getVariables = (opts) => {
      const variables = {}
      Object.getOwnPropertyNames(opts)
        .filter(variable => variable.startsWith(variablePrefix))
        .forEach(variable => variables[normalizeVariableName(variable)] = opts[variable])
      return variables
    }

    const normalizeVariableName = (variableName) => {
      const firstLetter = variableName.substring(variablePrefix.length, variablePrefix.length + 1)
      const rest = variableName.substring(variablePrefix.length + 1)

      return firstLetter.toLocaleLowerCase() + rest
    }
  </script>
</i18n>
