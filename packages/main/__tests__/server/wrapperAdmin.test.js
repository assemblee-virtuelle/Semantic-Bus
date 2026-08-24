// Test de sécurité — wrapperAdmin (SB-IDOR-2026-01).
//
// Vérifie que le middleware `wrapperAdmin` autorise uniquement les admins
// (statut persisté ou config.adminUsers) et refuse les non-admins.

jest.mock('@semantic-bus/core/lib/auth_lib', () => ({
  get_decoded_jwt: jest.fn()
}));
jest.mock('@semantic-bus/core/lib/user_lib', () => ({
  getWithRelations: jest.fn()
}));

const auth_lib = require('@semantic-bus/core/lib/auth_lib');
const user_lib = require('@semantic-bus/core/lib/user_lib');
const security = require('../../server/services/security');

describe('security.wrapperAdmin - autorisation admin', () => {
  function callWrapperAdmin() {
    const req = { body: { token: 'JWT abc' }, params: {}, headers: {} };
    const res = { status: jest.fn(() => res), send: jest.fn() };
    const next = jest.fn();
    security.wrapperAdmin(req, res, next);
    return { res, next };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    auth_lib.get_decoded_jwt.mockReturnValue({ iss: 'u1' });
  });

  test('autorise un admin', async () => {
    user_lib.getWithRelations.mockResolvedValue({ admin: true });
    const { res, next } = callWrapperAdmin();
    await Promise.resolve();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('refuse un non-admin avec 403', async () => {
    user_lib.getWithRelations.mockResolvedValue({ admin: false });
    const { res, next } = callWrapperAdmin();
    await new Promise(r => setImmediate(r));
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('refuse 403 si la résolution user échoue', async () => {
    user_lib.getWithRelations.mockRejectedValue(new Error('boom'));
    const { res, next } = callWrapperAdmin();
    await new Promise(r => setImmediate(r));
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('refuse 403 si le token ne décodé pas', () => {
    auth_lib.get_decoded_jwt.mockReturnValue(false);
    const { res, next } = callWrapperAdmin();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
