declare module ProcessNotifier {
  interface Start {
    _id: string
    callerId: string
    timeStamp: number
    steps: Array<{
      componentId: string
      status: string
    }>
  }

  interface Progress {
    componentId: string
    processId: string
    error: string | { message: string }
  }

  interface Error {
    _id: string
    error?: string
  }

  interface End {
    _id: string
  }

  type Persist = PersistSuccess | PersistError

  interface PersistSuccess {
    componentId: string
    processId: string
    data: any
  }

  interface PersistError {
    componentId: string
    processId: string
    error: string
  }

  interface ProcessCleaned {
    // Actually Array<ProcessModel> but not declared yet
    cleanedProcesses: Array<{}>
  }
}

