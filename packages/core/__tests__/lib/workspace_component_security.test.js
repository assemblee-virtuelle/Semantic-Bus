// Test de sécurité — workspace_component_lib.assertComponentInWorkspace
// (SB-IDOR-2026-01, confused deputy sur les routes composants).

jest.mock('../../models/workspace_component_model', () => {
  const findOne = jest.fn();
  return {
    __findOne: findOne,
    getInstance: jest.fn(() => ({ model: { findOne } }))
  };
});
jest.mock('../../models/workspace_model', () => ({
  getInstance: jest.fn(() => ({ model: {} }))
}));
jest.mock('../../models/historiqueEnd_model', () => ({
  getInstance: jest.fn(() => ({ model: {} }))
}));
jest.mock('../../helpers/error.js', () => ({}));
jest.mock('../../lib/specificDataValidator.js', () => ({ validateSpecificData: jest.fn(v => v) }));

const workspaceComponentModel = require('../../models/workspace_component_model');
const workspaceComponentLib = require('../../lib/workspace_component_lib.js');

const findOneMock = workspaceComponentModel.__findOne;

describe('workspace_component_lib.assertComponentInWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('autorise un composant appartenant au workspace autorisé', async () => {
    findOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve({ _id: 'comp', workspaceId: 'ws1' }) }) })
    });
    const c = await workspaceComponentLib.assertComponentInWorkspace('comp', 'ws1');
    expect(c._id).toBe('comp');
  });

  test('refuse un composant d un autre workspace', async () => {
    findOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve({ _id: 'comp', workspaceId: 'ws2' }) }) })
    });
    await expect(workspaceComponentLib.assertComponentInWorkspace('comp', 'ws1')).rejects.toMatchObject({ status: 403 });
  });

  test('refuse un composant inexistant', async () => {
    findOneMock.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve(null) }) })
    });
    await expect(workspaceComponentLib.assertComponentInWorkspace('comp', 'ws1')).rejects.toMatchObject({ status: 404 });
  });

  test('refuse un composant sans id', async () => {
    await expect(workspaceComponentLib.assertComponentInWorkspace(undefined, 'ws1')).rejects.toMatchObject({ status: 404 });
  });
});