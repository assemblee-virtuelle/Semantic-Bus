// Test de sécurité — IDOR sur POST /workspaces/:id/import (SB-IDOR-2026-01)
//
// Vérifie que la route d'import a bien le middleware `wrapperSecurity` (owner/editor)
// dans sa chaîne, au même titre que les routes sœurs qui écrivent des composants.

jest.mock('../../server/services/security', () => ({
  wrapperSecurity: jest.fn((req, res, next, role, entity) => next())
}));

jest.mock('@semantic-bus/core/lib/workspace_lib', () => ({}));
jest.mock('@semantic-bus/core', () => ({ user: {} }));
jest.mock('@semantic-bus/core/lib/auth_lib', () => ({}));
jest.mock('@semantic-bus/core/lib/workspace_component_lib', () => ({}));
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
