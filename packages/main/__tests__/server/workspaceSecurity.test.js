// Test de sécurité — IDOR sur POST /workspaces/:id/import (SB-IDOR-2026-01)
//
// Vérifie que la route d'import a bien le middleware `wrapperSecurity` (owner/editor)
// dans sa chaîne, au même titre que les routes sœurs qui écrivent des composants.

jest.mock('../../server/services/security', () => ({
  wrapperSecurity: jest.fn((req, res, next, role, entity) => next())
}));

jest.mock('@semantic-bus/core/lib/workspace_lib', () => ({
  create: jest.fn(() => Promise.resolve({ _id: 'WS', components: [] })),
  update: jest.fn(() => Promise.resolve({ components: [] })),
  getWorkspace: jest.fn(),
  addConnection: jest.fn(),
  get_workspace_simple: jest.fn(),
  updateSimple: jest.fn()
}));
jest.mock('@semantic-bus/core', () => ({ user: {} }));
jest.mock('@semantic-bus/core/lib/auth_lib', () => ({
  get_decoded_jwt: jest.fn(() => ({ iss: 'USER_ID' }))
}));
jest.mock('@semantic-bus/core/lib/workspace_component_lib', () => ({
  create: jest.fn(() => Promise.resolve([])),
  update: jest.fn(() => Promise.resolve({})),
  remove: jest.fn(() => Promise.resolve({})),
  assertComponentInWorkspace: jest.fn(() => Promise.resolve({ _id: 'comp', workspaceId: 'ws' })),
  get: jest.fn()
}));
jest.mock('@semantic-bus/core/lib/fragment_lib_scylla', () => ({}));
jest.mock('../../server/services/technicalComponentDirectory', () => ({}));

const registerRoutes = require('../../server/workspaceWebService');

describe('workspaceWebService - autorisation par workspace (IDOR)', () => {
  const securityService = require('../../server/services/security');

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

  // Exécute le premier middleware d'une route (le middleware de sécurité)
  // et retourne true si wrapperSecurity a été invoqué sur ce chemin.
  function routeProtected(mw) {
    securityService.wrapperSecurity.mockClear();
    const req = { params: {}, body: {} };
    const res = {};
    const next = jest.fn();
    mw[0](req, res, next);
    return securityService.wrapperSecurity.mock.calls.length > 0;
  }

  beforeEach(() => {
    securityService.wrapperSecurity.mockClear();
    routes = makeRouter();
    registerRoutes(routes);
  });

  test('POST /workspaces/:id/import applique wrapperSecurity (owner/editor)', () => {
    const mw = routes.store.post['/workspaces/:id/import'];
    expect(mw).toBeDefined();
    expect(routeProtected(mw)).toBe(true);
    const call = securityService.wrapperSecurity.mock.calls[0];
    expect(call[3]).toBe(undefined); // owner OU editor
    expect(call[4]).toBe('workflow');
  });

  test('les routes sœurs qui écrivent des composants appliquent aussi wrapperSecurity', () => {
    const siblings = [
      '/workspaces/:id/components',
      '/workspaces/:id/components/connection'
    ];
    for (const path of siblings) {
      const mw = routes.store.post[path];
      expect(mw).toBeDefined();
      expect(routeProtected(mw)).toBe(true);
    }
  });
});

describe('workspaceWebService - confused deputy sur les routes sœurs (SB-IDOR-2026-01)', () => {
  const securityService = require('../../server/services/security');
  const workspaceLib = require('@semantic-bus/core/lib/workspace_lib');
  const workspaceComponentLib = require('@semantic-bus/core/lib/workspace_component_lib');

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

  beforeEach(() => {
    securityService.wrapperSecurity.mockClear();
    jest.clearAllMocks();
    routes = makeRouter();
    registerRoutes(routes);
  });

  test('PUT /workspaces/:id lie la cible d écriture à req.params.id', async () => {
    const mw = routes.store.put['/workspaces/:id'];
    const req = { params: { id: 'WS_AUTHORIZED' }, body: { _id: 'WS_ATTACKER', name: 'PWNED' } };
    const res = { send: jest.fn() };
    const next = jest.fn();
    await mw[1](req, res, next);
    // la cible vient de req.params.id via un objet intermédiaire — req.body n est pas muté
    expect(workspaceLib.update).toHaveBeenCalledWith(expect.objectContaining({ _id: 'WS_AUTHORIZED', name: 'PWNED' }));
    expect(req.body._id).toBe('WS_ATTACKER'); // le body d'origine n est pas modifié
  });

  test('PUT /workspaces/:id/components/:componentId vérifie l appartenance du composant au workspace', async () => {
    const mw = routes.store.put['/workspaces/:id/components/:componentId'];
    const req = { params: { id: 'WS_AUTHORIZED', componentId: 'COMP_X' }, body: { name: 'x' } };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await mw[1](req, res, next);
    expect(workspaceComponentLib.assertComponentInWorkspace).toHaveBeenCalledWith('COMP_X', 'WS_AUTHORIZED');
    // la cible (componentId) et le workspaceId viennent des params, jamais du body._id
    expect(workspaceComponentLib.update).toHaveBeenCalledWith(expect.objectContaining({ _id: 'COMP_X', workspaceId: 'WS_AUTHORIZED' }));
  });

  test('DELETE /workspaces/:id/components/:componentId vérifie l appartenance du composant au workspace', async () => {
    const mw = routes.store.delete['/workspaces/:id/components/:componentId'];
    const req = { params: { id: 'WS_AUTHORIZED', componentId: 'COMP_X' }, body: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await mw[1](req, res, next);
    expect(workspaceComponentLib.assertComponentInWorkspace).toHaveBeenCalledWith('COMP_X', 'WS_AUTHORIZED');
    expect(workspaceComponentLib.remove).toHaveBeenCalledWith({ _id: 'COMP_X' });
  });

  test('DELETE /workspaces/:id/components/:componentId propage l erreur si composant hors workspace', async () => {
    const mw = routes.store.delete['/workspaces/:id/components/:componentId'];
    workspaceComponentLib.assertComponentInWorkspace.mockRejectedValueOnce(new Error('component_not_in_workspace'));
    const req = { params: { id: 'WS_AUTHORIZED', componentId: 'COMP_X' }, body: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await mw[1](req, res, next);
    expect(workspaceComponentLib.remove).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('workspaceWebService - POST /workspaces/ composants embarqués (SB-IDOR-2026-01)', () => {
  const securityService = require('../../server/services/security');
  const workspaceLib = require('@semantic-bus/core/lib/workspace_lib');
  const workspaceComponentLib = require('@semantic-bus/core/lib/workspace_component_lib');

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

  beforeEach(() => {
    jest.clearAllMocks();
    routes = makeRouter();
    registerRoutes(routes);
  });

  test('POST /workspaces/ avec composants embarqués estampe workspaceId sur chaque composant', async () => {
    const mw = routes.store.post['/workspaces/'];
    workspaceLib.create.mockResolvedValueOnce({ _id: 'WS_NEW', components: [] });
    workspaceLib.update.mockResolvedValueOnce({ _id: 'WS_NEW', components: ['COMP_1'] });
    workspaceComponentLib.create.mockResolvedValueOnce([{ _id: 'COMP_1', workspaceId: 'WS_NEW' }]);

    const req = {
      query: {},
      headers: { authorization: 'JTW xxxx' },
      body: { workspace: { name: 'n', limitHistoric: 1, components: [{ _id: 'c1', name: 'x' }] } }
    };
    const res = { send: jest.fn() };
    const next = jest.fn();

    await mw[0](req, res, next);

    // le workspace est créé sans composant embarqué (components vide)
    expect(workspaceLib.create).toHaveBeenCalledWith(
      'USER_ID',
      expect.objectContaining({ components: [] })
    );
    // les composants sont créés avec workspaceId estampé, jamais body._id
    expect(workspaceComponentLib.create).toHaveBeenCalledWith([
      expect.objectContaining({ _id: undefined, workspaceId: 'WS_NEW' })
    ]);
    expect(workspaceLib.update).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'WS_NEW', components: ['COMP_1'] })
    );
    expect(res.send).toHaveBeenCalledWith({ _id: 'WS_NEW', components: ['COMP_1'] });
    expect(next).not.toHaveBeenCalled();
  });

  test('POST /workspaces/ sans composant embarqué ne crée pas de composant', async () => {
    const mw = routes.store.post['/workspaces/'];
    workspaceLib.create.mockResolvedValueOnce({ _id: 'WS_NEW', components: [] });
    const req = { query: {}, headers: { authorization: 'JTW xxxx' }, body: { workspace: { name: 'n', limitHistoric: 1 } } };
    const res = { send: jest.fn() };
    const next = jest.fn();
    await mw[0](req, res, next);
    expect(workspaceComponentLib.create).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith({ _id: 'WS_NEW', components: [] });
  });
});
