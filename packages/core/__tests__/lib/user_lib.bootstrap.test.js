// Test de sécurité — user_lib : bootstrap admin (SB-IDOR-2026-01).
//
// Le premier utilisateur créé sur une instance vide (0 utilisateur en base)
// devient admin : un déploiement neuf reste exploitable sans configurer
// adminUsers dans config.json.

let savedAdminValue;
const countDocumentsMock = jest.fn();
const saveMock = jest.fn(function () {
  savedAdminValue = this.admin;
  return Promise.resolve(this);
});

class MockUserModel {
  constructor(data) {
    this._data = data;
  }
  get admin() {
    return this._data.admin;
  }
  set admin(v) {
    this._data.admin = v;
  }
  save() {
    return saveMock.call(this);
  }
}
MockUserModel.countDocuments = countDocumentsMock;

jest.mock('../../models/user_model', () => ({
  getInstance: jest.fn(() => ({ model: MockUserModel }))
}));
jest.mock('../../models', () => ({
  workspace: { getInstance: jest.fn(() => ({ model: {} })) },
  historiqueEnd: {},
  certificate: {}
}));
jest.mock('../../models/security_mail', () => ({}));
jest.mock('../../helpers', () => ({
  patterns: {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g,
    name: /^(?=.{1,20}$)([a-z-A-Z]+( )*[a-z-A-Z]+)+$/,
    password: /^[a-zA-Z0-9~!@#$%^&*()={}?\:\;\"\'\<\>\,\\\/áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ\._+-\s]{6,20}$/,
    job: /^(?=.{1,20}$)/
  }
}));
jest.mock('../../helpers/graph-traitment', () => ({}));
jest.mock('../../helpers/error.js', () => ({}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn((pw, salt, cb) => cb(null, 'hashed')),
  genSalt: jest.fn((rounds, cb) => cb(null, 'salt'))
}));
jest.mock('validator', () => ({ isEmail: jest.fn(() => true) }));

const user_lib = require('../../lib/user_lib.js');

describe('user_lib._create_mainprocess - bootstrap admin', () => {
  const baseUser = {
    email: 'alice@example.com',
    name: 'Alice',
    password: 'secret123',
    passwordConfirm: 'secret123'
  };

  beforeEach(() => {
    countDocumentsMock.mockReset();
    saveMock.mockClear();
  });

  test('premier utilisateur d une instance vide devient admin', async () => {
    countDocumentsMock.mockResolvedValue(0);
    await user_lib.create({ user: baseUser });
    expect(savedAdminValue).toBe(true);
  });

  test('les utilisateurs suivants ne sont pas admin', async () => {
    countDocumentsMock.mockResolvedValue(3);
    await user_lib.create({ user: baseUser });
    expect(savedAdminValue).toBe(false);
  });
});