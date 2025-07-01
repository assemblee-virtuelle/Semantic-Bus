// Mock pour cassandra-driver
module.exports = {
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(),
    execute: jest.fn().mockResolvedValue({
      rows: [],
      info: {}
    }),
    shutdown: jest.fn().mockResolvedValue(),
    batch: jest.fn().mockResolvedValue(),
    stream: jest.fn().mockReturnValue({
      on: jest.fn(),
      pipe: jest.fn()
    })
  })),
  types: {
    Uuid: {
      random: jest.fn(() => 'mock-uuid-12345'),
      fromString: jest.fn((str) => str)
    },
    TimeUuid: {
      now: jest.fn(() => 'mock-timeuuid-12345')
    },
    Long: {
      fromString: jest.fn((str) => parseInt(str))
    },
    distance: {
      local: 'local',
      remote: 'remote'
    }
  },
  policies: {
    loadBalancing: {
      DCAwareRoundRobinPolicy: jest.fn()
    },
    retry: {
      RetryPolicy: jest.fn()
    }
  },
  auth: {
    PlainTextAuthProvider: jest.fn()
  }
};