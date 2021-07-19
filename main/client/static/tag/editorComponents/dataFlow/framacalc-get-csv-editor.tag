<framacalc-get-csv-editor>
  <!-- bouton aide -->
  <div class="contenaireH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Framacalc" target="_blank"><img src="./image/help.png" alt="Aide" width="25px" height="25px"></a>
  </div>

  <!-- Titre du composant -->
  <div class="contenaireV title-component">{data.type}</div>
  <div>
    <div class="bar"/>
  </div>

  <!-- Description du composant -->
  <div class="title-description-component">{data.description}</div>
  <div>
    <div class="bar"/>
  </div>

  <!-- Champs du composant -->
  <div class="subtitle">Information de connexion à Framacalc.</div>

  <label class="labelFormStandard" for="framacalcEditorKey">
    URL framacalc / Ethercalc:
  </label>
  <div class="cardInput">
    <input class="inputComponents" type="text" name="keyInput" id="framacalcEditorKey"
           value={data.specificData.key} oninput={onKeyChange}
    />
  </div>

  <label class="labelFormStandard" for="framacalcEditorOffset">Commencer à partir de la ligne (offset, commence à 0):</label>
  <div class="cardInput">
    <input class="inputComponents" type="number" step="1" min="0" name="offsetInput" id="framacalcEditorOffset"
           value={data.specificData.offset} oninput={onOffsetChange}
    />
  </div>

  <framacalc-preview
    key={data.specificData.key}
    offset={data.specificData.offset}
  ></framacalc-preview>

  <script>
    this.data = {}

    this.onKeyChange = (event) => {
      this.data.specificData.key = event.currentTarget.value
    }

    this.onOffsetChange = (event) => {
      this.data.specificData.offset = event.currentTarget.value
    }

    this.updateData = (dataToUpdate) => {
      this.data = dataToUpdate;
      this.update();
    }

    this.on('mount', () => {
      RiotControl.on('item_current_changed', this.updateData)
    })

    this.on('unmount', () => {
      RiotControl.off('item_current_changed', this.updateData)
    })
  </script>
</framacalc-get-csv-editor>
