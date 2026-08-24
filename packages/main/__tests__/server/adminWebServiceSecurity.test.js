// Test de sécurité — routes de maintenance admin (CWE-862)
// Vérifie que cleanGarbage/cleanProcess/executeTimers passent par wrapperAdmin.

jest.mock('../../server/services/security', () => ({
  wrapperAdmin: jest.fn((req, res, next) => next())
}));
jest.mock('@semantic-bus/core', () => ({
  error: {},
  workspace: {}
}));

const registerRoutes = require('../../server/adminWebService');

describe('adminWebService - routes de maintenance réservées aux admins', () => {
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

  function routeHasWrapperAdmin(mw) {
    securityService.wrapperAdmin.mockClear();
    const req = { params: {}, body: {} };
    const res = {};
    const next = jest.fn();
    mw[0](req, res, next);
    return securityService.wrapperAdmin.mock.calls.length > 0;
  }

  beforeEach(() => {
    securityService.wrapperAdmin.mockClear();
    routes = makeRouter();
    registerRoutes(routes);
  });

  test('chaque route de maintenance passe par wrapperAdmin', () => {
    const paths = ['/cleanGarbageSimple', '/cleanGarbage', '/cleanProcess', '/executeTimers'];
    for (const path of paths) {
      const mw = routes.store.post[path];
      expect(mw).toBeDefined();
      expect(routeHasWrapperAdmin(mw)).toBe(true);
    }
  });
});