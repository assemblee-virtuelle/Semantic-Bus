export interface FramacalcData {
  specificData: FramacalcSpecificData
}

export interface FramacalcSpecificData {
  key: string
  offset: number
}

export interface FramacalcResult {
  data: Array<{ [ index: string ]: string }>
}