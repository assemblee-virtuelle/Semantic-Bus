jest.mock('../../lib/user_lib.js', () => ({
  getWithRelations: jest.fn()
}));
jest.mock('../../lib/workspace_component_lib.js', () => ({
  get: jest.fn()
}));
jest.mock('../../lib/auth_lib.js', () => ({
  get_decoded_jwt: jest.fn()
}));

const user_lib = require('../../lib/user_lib.js');
const workspace_component_lib = require('../../lib/workspace_component_lib.js');
const auth_lib = require('../../lib/auth_lib.js');
const { authorizeWorkAsk, getUserFromToken } = require('../../lib/engineWorkAuth.js');

const config = { adminUsers: ['admin@example.com'] };

// Simule un JWT valide/non expiré pour l'utilisateur `userId`.
function mockValidToken(userId) {
  auth_lib.get_decoded_jwt.mockReturnValue({
    iss: userId,
    exp: Math.floor(Date.now() / 1000) + 3600
  });
}
// Simule un JWT expiré.
function mockExpiredToken(userId) {
  auth_lib.get_decoded_jwt.mockReturnValue({
    iss: userId,
    exp: Math.floor(Date.now() / 1000) - 100
  });
}
// Simule un JWT invalide (get_decoded_jwt renvoie false).
function mockInvalidToken() {
  auth_lib.get_decoded_jwt.mockReturnValue(false);
}

describe('engineWorkAuth - autorisation des messages work-ask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('autorise un utilisateur owner sur le workspace du composant', async () => {
    mockValidToken('u1');
    workspace_component_lib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    user_lib.getWithRelations.mockResolvedValue({
      credentials: { email: 'u@x.com' },
      workspaces: [{ workspace: { _id: 'ws1' }, role: 'owner' }]
    });
    const r = await authorizeWorkAsk('any.token', 'comp1', config);
    expect(r.authorized).toBe(true);
  });

  test('autorise un utilisateur editor sur le workspace', async () => {
    mockValidToken('u1');
    workspace_component_lib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    user_lib.getWithRelations.mockResolvedValue({
      credentials: { email: 'u@x.com' },
      workspaces: [{ workspace: { _id: 'ws1' }, role: 'editor' }]
    });
    const r = await authorizeWorkAsk('any.token', 'comp1', config);
    expect(r.authorized).toBe(true);
  });

  test('refuse un utilisateur sans rôle sur le workspace', async () => {
    mockValidToken('u1');
    workspace_component_lib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    user_lib.getWithRelations.mockResolvedValue({
      credentials: { email: 'u@x.com' },
      workspaces: [{ workspace: { _id: 'ws2' }, role: 'owner' }] // autre workspace
    });
    const r = await authorizeWorkAsk('any.token', 'comp1', config);
    expect(r.authorized).toBe(false);
  });

  test('autorise un admin listé dans config.adminUsers', async () => {
    mockValidToken('admin1');
    workspace_component_lib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    user_lib.getWithRelations.mockResolvedValue({
      credentials: { email: 'admin@example.com' },
      workspaces: []
    });
    const r = await authorizeWorkAsk('any.token', 'comp1', config);
    expect(r.authorized).toBe(true);
  });

  test('ne traite pas comme admin un user sans adminUsers configuré (fallback par défaut)', async () => {
    mockValidToken('u1');
    workspace_component_lib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    // getWithRelations renvoie admin=true par défaut, mais SANS adminUsers on ne s'y fie pas
    user_lib.getWithRelations.mockResolvedValue({
      credentials: { email: 'u@x.com' },
      admin: true,
      workspaces: []
    });
    const r = await authorizeWorkAsk('any.token', 'comp1', {});
    expect(r.authorized).toBe(false);
  });

  test('refuse un token expiré', async () => {
    mockExpiredToken('u1');
    const r = await authorizeWorkAsk('any.token', 'comp1', config);
    expect(r.authorized).toBe(false);
    expect(workspace_component_lib.get).not.toHaveBeenCalled();
  });

  test('refuse un token invalide', async () => {
    mockInvalidToken();
    const r = await authorizeWorkAsk('bad.token', 'comp1', config);
    expect(r.authorized).toBe(false);
  });

  test('refuse un composant inexistant', async () => {
    mockValidToken('u1');
    workspace_component_lib.get.mockRejectedValue(new Error('not found'));
    const r = await authorizeWorkAsk('any.token', 'comp1', config);
    expect(r.authorized).toBe(false);
    expect(r.reason).toBe('component not found');
  });

  test('getUserFromToken retourne null pour un token invalide/absent', () => {
    expect(getUserFromToken(null)).toBe(null);
    auth_lib.get_decoded_jwt.mockReturnValue(false);
    expect(getUserFromToken('bad')).toBe(null);
  });
});

