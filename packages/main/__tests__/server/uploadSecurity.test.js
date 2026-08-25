// Test de sécurité — upload.js : l'upload d'un fichier exige owner/editor du workspace
// du composant cible (ou admin).

jest.mock('@semantic-bus/core/lib/file_lib_scylla', () => ({ create: jest.fn() }));
jest.mock('@semantic-bus/core/models/file_model_scylla', () => ({ model: class {} }));
jest.mock('@semantic-bus/core/lib/hmac_lib', () => ({ signMessage: jest.fn() }));
jest.mock('@semantic-bus/core/lib/auth_lib', () => ({ get_decoded_jwt: jest.fn() }));
jest.mock('@semantic-bus/core/lib/user_lib', () => ({ getWithRelations: jest.fn() }));
jest.mock('@semantic-bus/core/lib/workspace_component_lib', () => ({ get: jest.fn() }));
jest.mock('busboy', () => jest.fn(() => ({ on: jest.fn() })));
jest.mock('fs', () => ({}));
jest.mock('path', () => ({}));
jest.mock('@semantic-bus/core/dataTraitmentLibrary/file_convertor.js', () => ({}));
jest.mock('../../server/utils/propertyNormalizer.js', () => ({}));
jest.mock('stream', () => ({ Readable: class {} }));

const authLib = require('@semantic-bus/core/lib/auth_lib');
const userLib = require('@semantic-bus/core/lib/user_lib');
const componentLib = require('@semantic-bus/core/lib/workspace_component_lib');
const upload = require('../../server/workspaceComponentInitialize/upload.js');

describe('upload.assertUploadAccess - upload réservé aux owner/editor du workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authLib.get_decoded_jwt.mockReturnValue({ iss: 'u1' });
  });

  test('autorise un owner/editor du workspace du composant', async () => {
    componentLib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    userLib.getWithRelations.mockResolvedValue({
      admin: false,
      workspaces: [{ workspace: { _id: 'ws1' }, role: 'editor' }]
    });
    const ws = await upload.assertUploadAccess({ headers: { authorization: 'JWT x' }, query: {}, body: {} }, 'comp1');
    expect(ws).toBe('ws1');
  });

  test('refuse un non-membre du workspace (null)', async () => {
    componentLib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    userLib.getWithRelations.mockResolvedValue({
      admin: false,
      workspaces: [{ workspace: { _id: 'ws2' }, role: 'owner' }]
    });
    const ws = await upload.assertUploadAccess({ headers: { authorization: 'JWT x' }, query: {}, body: {} }, 'comp1');
    expect(ws).toBe(null);
  });

  test('autorise un admin', async () => {
    componentLib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    userLib.getWithRelations.mockResolvedValue({ admin: true, workspaces: [] });
    const ws = await upload.assertUploadAccess({ headers: { authorization: 'JWT x' }, query: {}, body: {} }, 'comp1');
    expect(ws).toBe('ws1');
  });

  test('refuse si le composant n existe pas', async () => {
    componentLib.get.mockRejectedValue(new Error('not found'));
    const ws = await upload.assertUploadAccess({ headers: { authorization: 'JWT x' }, query: {}, body: {} }, 'comp1');
    expect(ws).toBe(null);
  });

  test('refuse un rôle non owner/editor', async () => {
    componentLib.get.mockResolvedValue({ _id: 'comp1', workspaceId: 'ws1' });
    userLib.getWithRelations.mockResolvedValue({
      admin: false,
      workspaces: [{ workspace: { _id: 'ws1' }, role: 'viewer' }]
    });
    const ws = await upload.assertUploadAccess({ headers: { authorization: 'JWT x' }, query: {}, body: {} }, 'comp1');
    expect(ws).toBe(null);
  });
});