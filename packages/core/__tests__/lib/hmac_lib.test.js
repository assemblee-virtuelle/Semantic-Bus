const hmac = require('../../lib/hmac_lib.js');

describe('hmac_lib - signature HMAC des appels d\'exécution', () => {
  const body = { pushData: {}, queryParams: {}, direction: 'work' };

  test('sign + verify valide pour le bon componentId et corps', () => {
    const { signature, timestamp } = hmac.sign('comp1', body);
    expect(hmac.verify('comp1', body, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(true);
  });

  test('refuse un componentId différent', () => {
    const { signature, timestamp } = hmac.sign('comp1', body);
    expect(hmac.verify('comp2', body, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(false);
  });

  test('refuse un corps modifié (binding du corps)', () => {
    const { signature, timestamp } = hmac.sign('comp1', body);
    expect(hmac.verify('comp1', { pushData: { evil: 1 }, queryParams: {}, direction: 'work' }, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(false);
  });

  test('refuse l\'absence de signature / timestamp', () => {
    const { signature, timestamp } = hmac.sign('comp1', body);
    expect(hmac.verify('comp1', body, {})).toBe(false);
    expect(hmac.verify('comp1', body, { [hmac.HMAC_HEADER]: signature })).toBe(false);
    expect(hmac.verify('comp1', body, { [hmac.HMAC_TIMESTAMP_HEADER]: timestamp })).toBe(false);
  });

  test('refuse un timestamp expiré (anti-replay)', () => {
    const { signature, timestamp } = hmac.sign('comp1', body);
    expect(hmac.verify('comp1', body, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp - hmac.MAX_AGE_MS - 1000
    })).toBe(false);
  });

  test('signature indépendante de l\'ordre des clés du corps', () => {
    const ts = Date.now();
    const a = hmac.sign('x', { a: 1, b: 2 }, ts);
    const b = hmac.sign('x', { b: 2, a: 1 }, ts);
    expect(a.signature).toBe(b.signature);
  });
});

describe('hmac_lib - signMessage/verifyMessage (messages AMQP work-ask)', () => {
  test('signMessage puis verifyMessage valide pour le bon composant', () => {
    const msg = hmac.signMessage('comp1', { id: 'comp1', queryParams: { a: 1 } });
    expect(hmac.verifyMessage(msg)).toBe(true);
  });

  test('verifyMessage refuse un message non signé', () => {
    expect(hmac.verifyMessage({ id: 'comp1', queryParams: {} })).toBe(false);
  });

  test('verifyMessage refuse un message avec le mauvais id', () => {
    const msg = hmac.signMessage('comp1', { id: 'comp1', queryParams: {} });
    msg.id = 'comp2'; // altération de l'id ciblé
    expect(hmac.verifyMessage(msg)).toBe(false);
  });

  test('verifyMessage refuse un message dont le corps est modifié', () => {
    const msg = hmac.signMessage('comp1', { id: 'comp1', queryParams: { a: 1 } });
    msg.queryParams = { evil: 1 };
    expect(hmac.verifyMessage(msg)).toBe(false);
  });

  test('verifyMessage refuse un message avec timestamp expiré', () => {
    const msg = hmac.signMessage('comp1', { id: 'comp1' }, Date.now() - hmac.MAX_AGE_MS - 1000);
    expect(hmac.verifyMessage(msg)).toBe(false);
  });

  test('verifyMessage ignore un message signé en JWT (pas de champ hmac)', () => {
    expect(hmac.verifyMessage({ id: 'comp1', token: 'abc.def.ghi' })).toBe(false);
  });
});
