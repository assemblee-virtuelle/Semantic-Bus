<binary-extractor-editor>
  <!-- Help button -->
  <div class="containerH" style="margin-left:97%">
    <a href="https://github.com/assemblee-virtuelle/Semantic-Bus/wiki/Composant:-Binary-Extractor" target="_blank">
      <img src="./image/help.png" alt="Help" width="25px" height="25px">
    </a>
  </div>

  <!-- Component title -->
  <div class="contenaireV title-component">{data.type}</div>
  <div><div class="bar"/></div>

  <!-- Component description -->
  <div class="title-description-component">{data.description}</div>
  <div><div class="bar"/></div>


  <!-- File type selector -->
  <div>
    <label>File Type:</label>
    <select class="inputComponents" name="fileTypeInput" onchange={fileTypeInputChanged}>
      <option value="" selected={data.specificData.fileType === '' || data.specificData.fileType === undefined}>Select a file type</option>
      <option value="vnd.ms-excel" selected={data.specificData.fileType === 'vnd.ms-excel'}>Excel (vnd.ms-excel)</option>
      <option value="xlsx" selected={data.specificData.fileType === 'xlsx'}>Excel (xlsx)</option>
      <option value="rdf+xml" selected={data.specificData.fileType === 'rdf+xml'}>RDF (rdf+xml)</option>
      <option value="ics" selected={data.specificData.fileType === 'ics'}>ICS</option>
      <option value="zip" selected={data.specificData.fileType === 'zip'}>ZIP</option>
      <option value="gz" selected={data.specificData.fileType === 'gz'}>GZ</option>
      <option value="json" selected={data.specificData.fileType === 'json'}>JSON</option>
      <option value="json-ld" selected={data.specificData.fileType === 'json-ld'}>JSON-LD</option>
      <option value="umap" selected={data.specificData.fileType === 'umap'}>UMap</option>
      <option value="geojson" selected={data.specificData.fileType === 'geojson'}>GeoJSON</option>
      <option value="ttl" selected={data.specificData.fileType === 'ttl'}>TTL</option>
      <option value="rdf" selected={data.specificData.fileType === 'rdf'}>RDF</option>
      <option value="owl" selected={data.specificData.fileType === 'owl'}>OWL</option>
      <option value="xls" selected={data.specificData.fileType === 'xls'}>Excel (xls)</option>
      <option value="ods" selected={data.specificData.fileType === 'ods'}>ODS</option>
      <option value="xml" selected={data.specificData.fileType === 'xml'}>XML</option>
      <option value="kml" selected={data.specificData.fileType === 'kml'}>KML</option>
      <option value="csv" selected={data.specificData.fileType === 'csv'}>CSV</option>
      <option value="calendar" selected={data.specificData.fileType === 'calendar'}>Calendar</option>
    </select>
  </div>


  <!-- File type specific parameters -->
  <div id="spreadsheetInputs" data-file-type="xls,xlsx,ods">
    <label class="labelFormStandard">Sheet Name:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.sheetName} data-key="sheetName" />
    </div>
    <label class="labelFormStandard">Cell Range:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.cellRange} data-key="cellRange" />
    </div>
  </div>

  <div id="rdfInputs" data-file-type="rdf,owl,ttl">
    <label class="labelFormStandard">Namespace:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.namespace} data-key="namespace" />
    </div>
    <label class="labelFormStandard">Base URI:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.baseURI} data-key="baseURI" />
    </div>
  </div>

  <div id="jsonInputs" data-file-type="json,json-ld,umap,geojson">
    <label class="labelFormStandard">Node Path:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.nodePath} data-key="nodePath" />
    </div>
  </div>

  <div id="xmlInputs" data-file-type="xml,kml">
    <label class="labelFormStandard">XPath:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.xpath} data-key="xpath" />
    </div>
  </div>

  <div id="csvInputs" data-file-type="csv">
    <label class="labelFormStandard">Delimiter:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.delimiter} data-key="delimiter" />
    </div>
    <label class="labelFormStandard">Encoding:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.encoding} data-key="encoding" />
    </div>
  </div>

  <div id="calendarInputs" data-file-type="ics,calendar">
    <label class="labelFormStandard">Event Type:</label>
    <div class="cardInput">
      <input class="inputComponents" type="text" oninput={updateSpecificData} value={data.specificData.extractionParams.eventType} data-key="eventType" />
    </div>
  </div>


  <script>
    this.data = {
      specificData: {
        extractionParams: {}
      }
    };

    this.updateData = function(dataToUpdate) {
      this.data = dataToUpdate;
      this.data.specificData.extractionParams = this.data.specificData.extractionParams || {};
      this.update();
    this.updateVisibility();
    }.bind(this);

    this.on('mount', function() {
      RiotControl.on('item_current_changed', this.updateData);
    });

    this.on('unmount', function() {
      RiotControl.off('item_current_changed', this.updateData);
    });

    changePath(e) {
      this.data.specificData.path = e.currentTarget.value;
    }

    updateSpecificData(e) {
      const key = e.target.getAttribute('data-key');
      console.log(key,e);
      if (key) {
        this.data.specificData.extractionParams[key] = e.target.value;
      }
    }

    updateVisibility() {
      const fileType = this.data.specificData.fileType;
      const inputGroups = this.root.querySelectorAll('[data-file-type]');
      console.log('updateVisibility',inputGroups, fileType);
      inputGroups.forEach(group => {
        const types = group.getAttribute('data-file-type').split(',');
        if (types.includes(fileType)) {
          group.classList.remove("hide");
        } else {
          group.classList.add("hide");
        }
      });
    }

    fileTypeInputChanged(e) {
      this.data.specificData.fileType = e.currentTarget.value;
      this.updateVisibility();
      this.update();
    }
  </script>
  <style>
  .hide {
    display: none;
  }
  </style>
</binary-extractor-editor> 