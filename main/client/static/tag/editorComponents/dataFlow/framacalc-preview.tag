<framacalc-preview>
  <div class="outputSample">
    <h2>Prévisualisation</h2>

    <p>
      Ci-dessous une prévisualisation des données qui seront utilisées durant le traitement.
    </p>

    <p if={loading}>
      Chargement en cours, veuillez patienter.
    </p>

    <p if={!loading && error} class="alert alert-warning">
      {error}
    </p>

    <table class="table-preview" if={!loading && !error}>
      <tr each={ line in rows }>
        <td each={ cell in line }>{cell}</td>
      </tr>
      <tr if={hasMore}>
        <td colspan={ maxColumns } class="truncated">données tronquées</td>
      </tr>
    </table>
  </div>

  <script>
    this.previousOpts = {}
    this.loading = false
    this.error = undefined
    this.downloaded = undefined
    this.rows = undefined
    this.hasMore = false
    this.maxColumns = 0

    this.on('mount', () => this.reload())
    this.on('update', () => this.reload())

    this.reload = () => {
      if (this.previousOpts.key !== this.opts.key) {
        this.loadData(this.opts.key)
      } else {
        this.formatSample()
      }
      this.previousOpts = {...this.opts}
    }

    this.loadData = (key) => {
      if (key !== undefined && key !== '') {
        this.loading = true
        this.error = undefined
        fetch(this.normalizeUrl(key))
          .then(response => {
            if (response.status === 200) {
              return response.text()
            } else if (response.status === 404) {
              return Promise.reject('NOT_FOUND')
            } else {
              return Promise.reject(response.text())
            }

          })
          .then(body => {
            // No change in url during downloading
            if (this.opts.key === key) {
              this.downloaded = Papa.parse(body).data
              this.loading = false
              this.formatSample()
              this.update()
            }
          })
          .catch(error => {
            if (error === 'NOT_FOUND') {
              this.error = 'La feuille de calcul n\'a pas été trouvée.'
            } else {
              this.error = `Une erreur est survenue lors de la récupération de la feuille de calcul: ${error}`
            }
            this.loading = false
            this.update()
          })
      } else {
        this.downloaded = undefined
      }
    }

    this.normalizeUrl = (url) => {
      if (url.startsWith('http')) {
        if (url.endsWith('.csv')) {
          return url
        } else {
          return `${url}.csv`
        }
      } else {
        if (url.endsWith('.csv')) {
          return `https://framacalc.org/${url}`
        } else {
          return `https://framacalc.org/${url}.csv`
        }
      }
    }

    this.formatSample = () => {
      if (this.downloaded !== undefined) {
        const offset = parseInt(this.opts.offset) || 0
        this.rows = this.downloaded.slice(offset, offset + 10)
        this.hasMore = this.downloaded.length - offset - 10 > 0
        this.maxColumns = this.rows.reduce((acc, current) => Math.max(acc, current.length), 0)
      }
    }

  </script>
</framacalc-preview>
