export interface SpecificData {
  mappingTable: Array<MappingValue>
}

export interface MappingValue {
  rowId: number
  opts: MappingValueOpts
  flowValue: string
  replacementValue: string
}

export interface MappingValueOpts {
  ref: 'mappingTable'
  style: string
  drag: boolean
  title: string
  allowdirectedit: boolean
  disallowselect: boolean
  disallownavigation: boolean
}

export interface MapValueResult {
  sourceValue: string
  translatedValue: string
}

export interface MapValuesResult {
  data: { error: string } | Array<MapValueResult>
}