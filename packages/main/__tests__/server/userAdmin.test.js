// Test de sécurité — gestion admin des users (SB-IDOR-2026-01).
//
// Vérifie que :
//   - GET /users est réservé aux admins (wrapperAdmin)
//   - PUT /users/:id/admin (promotion/dépromotion admin) est réservé aux admins

jest.mock('../../server/services/security', () => ({
  wrapperAdmin: jest.fn((req, res, next) => next())
}));

jest.mock('@semantic-bus/core/lib/user_lib', () => ({
  get_all: jest.fn(),
  getWithRelations: jest.fn(() => Promise.resolve({})),
  updateAdmin: jest.fn(() => Promise.resolve({}))
}));
jest.mock('@semantic-bus/core/lib/auth_lib', () => ({ get_decoded_jwt: jest.fn() }));
jest.mock('../../server/services/mail', () => ({}));
jest.mock('../../server/validations', () => ({ validateRequestInput: jest.fn(() => (req, res, next) => next()) }));
jest.mock('../../server/validations/userValidations', () => ({ userPatchType: {} }));
jest.mock('jwt-simple', () => ({}));
jest.mock('moment', () => ({}));
jest.mock('busboy', () => ({}));

const registerRoutes = require('../../server/userWebservices');

describe('userWebservices - gestion admin (autorisation)', () => {
  const securityService = require('../../server/services/security');

  let routes;
  function makeRouter() {
    const store = { post: {}, put: {}, delete: {}, get: {}, patch: {} };
    return {
      post: (path, ...mw) => { store.post[path] = mw; },
      put: (path, ...mw) => { store.put[path] = mw; },
      delete: (path, ...mw) => { store.delete[path] = mw; },
      get: (path, ...mw) => { store.get[path] = mw; },
      patch: (path, ...mw) => { store.patch[path] = mw; },
      store
    };
  }

  function routeProtected(mw) {
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

  test('GET /users est protégé par wrapperAdmin', () => {
    const mw = routes.store.get['/users'];
    expect(mw).toBeDefined();
    expect(routeProtected(mw)).toBe(true);
  });

  test('PUT /users/:id/admin est protégé par wrapperAdmin', () => {
    const mw = routes.store.put['/users/:id/admin'];
    expect(mw).toBeDefined();
    expect(routeProtected(mw)).toBe(true);
  });

  test('GET /users/me reste accessible sans wrapperAdmin', () => {
    const mw = routes.store.get['/users/me'];
    expect(mw).toBeDefined();
    securityService.wrapperAdmin.mockClear();
    const authLib = require('@semantic-bus/core/lib/auth_lib');
    authLib.get_decoded_jwt.mockReturnValue({ iss: 'u1' });
    mw[0](
      { body: { token: 'JWT abc' }, params: {}, headers: {} },
      { send: jest.fn() },
      jest.fn()
    );
    expect(securityService.wrapperAdmin).not.toHaveBeenCalled();
  });

  test('PUT /users/:id/admin refuse la dépromotion de soi-même', async () => {
    const authLib = require('@semantic-bus/core/lib/auth_lib');
    const userLib = require('@semantic-bus/core/lib/user_lib');
    authLib.get_decoded_jwt.mockReturnValue({ iss: 'u1' });
    userLib.updateAdmin.mockClear();
    const mw = routes.store.put['/users/:id/admin'];
    const res = { status: jest.fn(() => res), send: jest.fn() };
    const next = jest.fn();
    await mw[1](
      { body: { token: 'JWT abc', admin: false }, params: { id: 'u1' }, headers: {} },
      res,
      next
    );
    expect(userLib.updateAdmin).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Vous ne pouvez pas retirer votre propre rôle administrateur.' });
  });

  test('PUT /users/:id/admin permet de dépromouvoir un autre user', async () => {
    const authLib = require('@semantic-bus/core/lib/auth_lib');
    const userLib = require('@semantic-bus/core/lib/user_lib');
    authLib.get_decoded_jwt.mockReturnValue({ iss: 'u1' });
    userLib.updateAdmin.mockResolvedValue({ _id: 'u2', admin: false });
    const mw = routes.store.put['/users/:id/admin'];
    const res = { send: jest.fn() };
    const next = jest.fn();
    await mw[1](
      { body: { token: 'JWT abc', admin: false }, params: { id: 'u2' }, headers: {} },
      res,
      next
    );
    expect(userLib.updateAdmin).toHaveBeenCalledWith('u2', false);
    expect(next).not.toHaveBeenCalled();
  });

  test('GET /users/emails est accessible sans wrapperAdmin et renvoie seulement les emails', async () => {
    const userLib = require('@semantic-bus/core/lib/user_lib');
    securityService.wrapperAdmin.mockClear();
    userLib.get_all.mockResolvedValue([
      { credentials: { email: 'alice@example.com' } },
      { credentials: { email: 'bob@example.com' } },
      { name: 'no-email' }
    ]);
    const mw = routes.store.get['/users/emails'];
    expect(mw).toBeDefined();
    const res = { send: jest.fn() };
    const next = jest.fn();
    await mw[0]({ body: {}, params: {}, headers: {} }, res, next);
    expect(securityService.wrapperAdmin).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(['alice@example.com', 'bob@example.com']);
  });
});
