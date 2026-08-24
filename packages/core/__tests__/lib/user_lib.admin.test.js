// Test de sécurité — user_lib : ne pas traiter tout utilisateur comme admin
// quand `adminUsers` est absent (SB-IDOR-2026-01, note du chercheur).
//
// Par défaut (config sans adminUsers, ou config undefined), un utilisateur
// ne doit PAS être considéré comme admin (moindre privilège).

jest.mock('../../models/user_model', () => {
  const findOne = jest.fn();
  const countDocuments = jest.fn();
  const findByIdAndUpdate = jest.fn();
  const find = jest.fn();
  const deleteOne = jest.fn();
  return {
    __findOne: findOne,
    __countDocuments: countDocuments,
    __findByIdAndUpdate: findByIdAndUpdate,
    __find: find,
    __deleteOne: deleteOne,
    getInstance: jest.fn(() => ({ model: { findOne, countDocuments, findByIdAndUpdate, find, deleteOne } }))
  };
});
jest.mock('../../models', () => {
  const find = jest.fn();
  const workspaceAggregate = jest.fn();
  const processAggregate = jest.fn();
  const workspaceFindOne = jest.fn();
  const workspaceUpdateMany = jest.fn();
  const authDeleteMany = jest.fn();
  return {
    __find: find,
    __workspaceAggregate: workspaceAggregate,
    __processAggregate: processAggregate,
    __workspaceFindOne: workspaceFindOne,
    __workspaceUpdateMany: workspaceUpdateMany,
    __authDeleteMany: authDeleteMany,
    workspace: {
      getInstance: jest.fn(() => ({ model: { find, findOne: workspaceFindOne, updateMany: workspaceUpdateMany, aggregate: () => ({ exec: workspaceAggregate }) } }))
    },
    process: {
      getInstance: jest.fn(() => ({ model: { aggregate: () => ({ exec: processAggregate }) } }))
    },
    authentication: {
      getInstance: jest.fn(() => ({ model: { deleteMany: authDeleteMany } }))
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
const workspaceAggregateMock = models.__workspaceAggregate;
const processAggregateMock = models.__processAggregate;
const workspaceFindOneMock = models.__workspaceFindOne;
const workspaceUpdateManyMock = models.__workspaceUpdateMany;
const authDeleteManyMock = models.__authDeleteMany;

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

describe('user_lib.getAdminUsersStats - stats admin (workflows, dates)', () => {
  const userFindMock = userModel.__find;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockStatsData() {
    userFindMock.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: () => Promise.resolve([
            { _id: 'u1', name: 'Alice', credentials: { email: 'alice@example.com' }, admin: true, dates: { created_at: new Date('2026-01-01') }, lastLogin: new Date('2026-08-01') }
          ])
        })
      })
    });
    workspaceAggregateMock.mockResolvedValue([
      { _id: { email: 'alice@example.com', role: 'owner' }, count: 2 },
      { _id: { email: 'alice@example.com', role: 'editor' }, count: 1 }
    ]);
    processAggregateMock.mockResolvedValue([{ _id: 'u1', lastExecution: new Date('2026-08-20') }]);
  }

  test('retourne les stats agrégées par user', async () => {
    mockStatsData();
    const res = await user_lib.getAdminUsersStats();
    expect(res).toHaveLength(1);
    const u = res[0];
    expect(u.email).toBe('alice@example.com');
    expect(u.admin).toBe(true);
    expect(u.workspaceCount).toBe(2);
    expect(u.contributorCount).toBe(1);
    expect(u.createdAt).toEqual(new Date('2026-01-01'));
    expect(u.lastLogin).toEqual(new Date('2026-08-01'));
    expect(u.lastExecution).toEqual(new Date('2026-08-20'));
  });

  test('retourne 0 workflow et dates null si absents', async () => {
    userFindMock.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: () => Promise.resolve([
            { _id: 'u2', name: 'Bob', credentials: { email: 'bob@example.com' }, admin: false, dates: {}, lastLogin: null }
          ])
        })
      })
    });
    workspaceAggregateMock.mockResolvedValue([]);
    processAggregateMock.mockResolvedValue([]);
    const res = await user_lib.getAdminUsersStats();
    expect(res[0].workspaceCount).toBe(0);
    expect(res[0].contributorCount).toBe(0);
    expect(res[0].createdAt).toBe(null);
    expect(res[0].lastExecution).toBe(null);
  });
});

describe('user_lib.getUserWorkflows - détail des workflows d un user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retourne les workflows avec rôle et dernière exécution', async () => {
    // user par id
    findOneMock.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: () => Promise.resolve({ _id: 'u1', credentials: { email: 'alice@example.com' } })
        })
      })
    });
    // workspaces du user
    findMock.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: () => Promise.resolve([
            { _id: 'ws1', name: 'Flux A', users: [{ email: 'alice@example.com', role: 'owner' }] },
            { _id: 'ws2', name: 'Flux B', users: [{ email: 'alice@example.com', role: 'editor' }] }
          ])
        })
      })
    });
    // dernières exécutions par workflow
    processAggregateMock.mockResolvedValue([
      { _id: 'ws1', lastExecution: new Date('2026-08-20') }
    ]);

    const res = await user_lib.getUserWorkflows('u1');
    expect(res).toHaveLength(2);
    expect(res[0]).toEqual({
      _id: 'ws1', name: 'Flux A', role: 'owner', isOwner: true, lastExecution: new Date('2026-08-20')
    });
    expect(res[1]).toEqual({
      _id: 'ws2', name: 'Flux B', role: 'editor', isOwner: false, lastExecution: null
    });
  });

  test('lève une erreur si le user est introuvable', async () => {
    findOneMock.mockReturnValue({
      select: () => ({
        lean: () => ({ exec: () => Promise.resolve(null) })
      })
    });
    await expect(user_lib.getUserWorkflows('uX')).rejects.toThrow();
  });
});

describe('user_lib.deleteUser - suppression d un user (admin)', () => {
  const userDeleteOneMock = userModel.__deleteOne;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockUserFound() {
    findOneMock.mockReturnValue({
      select: () => ({
        lean: () => ({ exec: () => Promise.resolve({ _id: 'u1', credentials: { email: 'bob@example.com' } }) })
      })
    });
  }

  test('refuse si le user est owner d un workspace', async () => {
    mockUserFound();
    workspaceFindOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve({ _id: 'ws1' }) }) })
    });
    await expect(user_lib.deleteUser('u1')).rejects.toMatchObject({ code: 'USER_IS_WORKSPACE_OWNER' });
    // La garde owner doit utiliser $elemMatch (pas un filtre plat qui matcherait
    // deux éléments différents du tableau users).
    expect(workspaceFindOneMock).toHaveBeenCalledWith(
      { users: { $elemMatch: { email: 'bob@example.com', role: 'owner' } } }
    );
  });

  test('retire les contributions et supprime le user + auths', async () => {
    mockUserFound();
    workspaceFindOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve(null) }) })
    });
    workspaceUpdateManyMock.mockReturnValue({ exec: () => Promise.resolve({ modifiedCount: 1 }) });
    authDeleteManyMock.mockReturnValue({ exec: () => Promise.resolve({ deletedCount: 2 }) });
    userDeleteOneMock.mockReturnValue({ exec: () => Promise.resolve({ deletedCount: 1 }) });

    const res = await user_lib.deleteUser('u1');
    expect(res).toEqual({ deleted: true, email: 'bob@example.com' });
    expect(workspaceUpdateManyMock).toHaveBeenCalledWith(
      { 'users.email': 'bob@example.com' },
      { $pull: { users: { email: 'bob@example.com' } } }
    );
    expect(authDeleteManyMock).toHaveBeenCalledWith({ user: 'u1' });
  });

  test('lève une erreur si le user est introuvable', async () => {
    findOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve(null) }) })
    });
    await expect(user_lib.deleteUser('uX')).rejects.toThrow();
  });
});
