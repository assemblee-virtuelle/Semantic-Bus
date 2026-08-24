// Test de sécurité — IDOR de lecture fichiers (CWE-639)
// Vérifie que GET /file/:fileId et /download vérifient l'accès au workspace du process.

jest.mock('@semantic-bus/core/lib/file_lib_scylla', () => ({
  get: jest.fn()
}));
jest.mock('@semantic-bus/core/models', () => {
  const findOne = jest.fn();
  return {
    __findOne: findOne,
    process: {
      getInstance: jest.fn(() => ({ model: { findOne } }))
    }
  };
});
jest.mock('@semantic-bus/core/lib/auth_lib', () => ({
  get_decoded_jwt: jest.fn()
}));
jest.mock('@semantic-bus/core/lib/user_lib', () => ({
  getWithRelations: jest.fn()
}));

const fileLib = require('@semantic-bus/core/lib/file_lib_scylla');
const models = require('@semantic-bus/core/models');
const authLib = require('@semantic-bus/core/lib/auth_lib');
const userLib = require('@semantic-bus/core/lib/user_lib');
const registerRoutes = require('../../server/fileWebservices');

const processFindOneMock = models.__findOne;

describe('fileWebservices - accès fichier lié au workspace (IDOR de lecture)', () => {
  let routes;
  function makeRouter() {
    const store = { post: {}, put: {}, delete: {}, get: {} };
    return {
      post: (path, ...mw) => { store.post[path] = mw; },
      put: (path, ...mw) => { store.put[path] = mw; },
      delete: (path, ...mw) => { store.delete[path] = mw; },
      get: (path, ...mw) => { store.get[path] = mw; },
      store
    };
  }

  function callRoute(path, req) {
    const mw = routes.store.get[path];
    const res = { status: jest.fn(() => res), send: jest.fn(), setHeader: jest.fn() };
    const next = jest.fn();
    mw[0](req, res, next);
    return { res, next };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    routes = makeRouter();
    registerRoutes(routes);
    authLib.get_decoded_jwt.mockReturnValue({ iss: 'u1' });
  });

  function mockFileWithProcess(processId) {
    fileLib.get.mockResolvedValue({ processId, binary: 'data', filename: 'x.bin' });
    processFindOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve({ workflowId: 'ws1' }) }) })
    });
  }

  test('autorise un membre du workspace du process', async () => {
    mockFileWithProcess('proc1');
    userLib.getWithRelations.mockResolvedValue({
      admin: false,
      workspaces: [{ workspace: { _id: 'ws1' }, role: 'editor' }]
    });
    const req = { params: { fileId: 'f1' }, query: {}, headers: { authorization: 'JWT x' }, body: {} };
    const { res } = callRoute('/file/:fileId', req);
    await new Promise(r => setTimeout(r, 100));
    expect(res.send).toHaveBeenCalled();
  });

  test('refuse un non-membre du workspace du process (403)', async () => {
    mockFileWithProcess('proc1');
    userLib.getWithRelations.mockResolvedValue({
      admin: false,
      workspaces: [{ workspace: { _id: 'ws2' }, role: 'owner' }]
    });
    const req = { params: { fileId: 'f1' }, query: {}, headers: { authorization: 'JWT x' }, body: {} };
    const { res } = callRoute('/file/:fileId', req);
    await new Promise(r => setTimeout(r, 100));
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('autorise un admin', async () => {
    mockFileWithProcess('proc1');
    userLib.getWithRelations.mockResolvedValue({ admin: true, workspaces: [] });
    const req = { params: { fileId: 'f1' }, query: {}, headers: { authorization: 'JWT x' }, body: {} };
    const { res } = callRoute('/file/:fileId/download', req);
    await new Promise(r => setTimeout(r, 100));
    expect(res.send).toHaveBeenCalled();
  });

  test('autorise un fichier cache sans process (JWT)', async () => {
    fileLib.get.mockResolvedValue({ processId: null, binary: 'data' });
    const req = { params: { fileId: 'f1' }, query: {}, headers: { authorization: 'JWT x' }, body: {} };
    const { res } = callRoute('/file/:fileId', req);
    await new Promise(r => setTimeout(r, 100));
    expect(res.send).toHaveBeenCalled();
  });

  test('refuse un membre du workspace avec un rôle non owner/editor', async () => {
    mockFileWithProcess('proc1');
    userLib.getWithRelations.mockResolvedValue({
      admin: false,
      workspaces: [{ workspace: { _id: 'ws1' }, role: 'viewer' }]
    });
    const req = { params: { fileId: 'f1' }, query: {}, headers: { authorization: 'JWT x' }, body: {} };
    const { res } = callRoute('/file/:fileId', req);
    await new Promise(r => setTimeout(r, 100));
    expect(res.status).toHaveBeenCalledWith(403);
  });
});