// Test de sécurité — user_lib : ne pas traiter tout utilisateur comme admin
// quand `adminUsers` est absent (SB-IDOR-2026-01, note du chercheur).
//
// Par défaut (config sans adminUsers, ou config undefined), un utilisateur
// ne doit PAS être considéré comme admin (moindre privilège).

jest.mock('../../models/user_model', () => {
  const findOne = jest.fn();
  const countDocuments = jest.fn();
  const findByIdAndUpdate = jest.fn();
  return {
    __findOne: findOne,
    __countDocuments: countDocuments,
    __findByIdAndUpdate: findByIdAndUpdate,
    getInstance: jest.fn(() => ({ model: { findOne, countDocuments, findByIdAndUpdate } }))
  };
});
jest.mock('../../models', () => {
  const find = jest.fn();
  return {
    __find: find,
    workspace: {
      getInstance: jest.fn(() => ({ model: { find } }))
    },
    historiqueEnd: {},
    certificate: {}
  };
});
jest.mock('../../models/security_mail', () => ({}));
jest.mock('../../helpers', () => ({ patterns: {} }));
jest.mock('../../helpers/graph-traitment', () => ({}));
jest.mock('../../helpers/error.js', () => ({}));
jest.mock('bcryptjs', () => ({}));
jest.mock('validator', () => ({}));

const userModel = require('../../models/user_model');
const models = require('../../models');
const user_lib = require('../../lib/user_lib.js');

const findOneMock = userModel.__findOne;
const countDocumentsMock = userModel.__countDocuments;
const findMock = models.__find;

describe('user_lib.getWithRelations - défaut admin (moindre privilège)', () => {
  function mockModels(email, admin = false) {
    findOneMock.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve({ _id: 'u1', credentials: { email }, admin }) })
    });
    findMock.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve([]) })
    });
  }

  test('ne considère pas comme admin un user sans adminUsers configuré', async () => {
    mockModels('alice@example.com');
    const res = await user_lib.getWithRelations('u1', {});
    expect(res.admin).toBe(false);
  });

  test('ne considère pas comme admin un user si config undefined', async () => {
    mockModels('alice@example.com');
    const res = await user_lib.getWithRelations('u1', undefined);
    expect(res.admin).toBe(false);
  });

  test('considère comme admin un user listé dans config.adminUsers', async () => {
    mockModels('admin@example.com');
    const res = await user_lib.getWithRelations('u1', { adminUsers: ['admin@example.com'] });
    expect(res.admin).toBe(true);
  });

  test('ne considère pas comme admin un user non listé dans adminUsers', async () => {
    mockModels('alice@example.com');
    const res = await user_lib.getWithRelations('u1', { adminUsers: ['admin@example.com'] });
    expect(res.admin).toBe(false);
  });

  test('bootstrap admin : premier utilisateur persisté admin reste admin sans adminUsers', async () => {
    mockModels('alice@example.com', true);
    const res = await user_lib.getWithRelations('u1', {});
    expect(res.admin).toBe(true);
  });

  test('adminUsers configuré prime sur le statut persisté', async () => {
    mockModels('alice@example.com', true);
    const res = await user_lib.getWithRelations('u1', { adminUsers: ['other@example.com'] });
    expect(res.admin).toBe(false);
  });
});

describe('user_lib.updateAdmin - promotion/dépromotion admin', () => {
  const findByIdAndUpdateMock = userModel.__findByIdAndUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('promote un user à admin', async () => {
    findByIdAndUpdateMock.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve({ _id: 'u2', admin: true }) })
    });
    const user = await user_lib.updateAdmin('u2', true);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      'u2',
      { $set: { admin: true } },
      { new: true }
    );
    expect(user.admin).toBe(true);
  });

  test('déprote un user admin', async () => {
    findByIdAndUpdateMock.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve({ _id: 'u2', admin: false }) })
    });
    const user = await user_lib.updateAdmin('u2', false);
    expect(user.admin).toBe(false);
  });
});
