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

  test('sign avec un ObjectId bson : la signature survive à un aller-retour JSON (normalisation)', () => {
    // Cas réel : workspace_lib (timer) signe avec component._id (ObjectId mongo)
    // et le vérificateur reçoit le corps après un aller-retour JSON (hex).
    // NB: bson (dépendance directe de core) fournit ObjectId — mongodb n'est
    // pas déclaré comme dép de core (résolution CI par package).
    const { ObjectId } = require('bson');
    const oid = new ObjectId('696518bec4d126b4fab958cb');
    const body = { id: oid, queryParams: { a: 1 } };
    const { signature, timestamp } = hmac.sign(oid, body);
    // Round-trip JSON = ce que voit le vérificateur (requête HTTP)
    const roundTrippedBody = JSON.parse(JSON.stringify(body));
    expect(hmac.verify(String(oid), roundTrippedBody, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(true);
  });
});

describe('hmac_lib - signBuffer/verifyBuffer (corps bruts, aller-retour HTTP eval-service)', () => {
  test('signBuffer + verifyBuffer valide sur les mêmes octets', () => {
    const raw = Buffer.from(JSON.stringify({ expression: '1+1', variables: {} }));
    const { signature, timestamp } = hmac.signBuffer('eval', raw);
    expect(hmac.verifyBuffer('eval', raw, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(true);
  });

  test('signBuffer + verifyBuffer valide avec une string (pas Buffer)', () => {
    const rawStr = '{"expression":"1+1"}';
    const { signature, timestamp } = hmac.signBuffer('eval', rawStr);
    expect(hmac.verifyBuffer('eval', rawStr, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(true);
  });

  test('refuse un octet modifié (binding exact des octets)', () => {
    const raw = Buffer.from('{"expression":"1+1"}');
    const { signature, timestamp } = hmac.signBuffer('eval', raw);
    const tampered = Buffer.from('{"expression":"1+2"}');
    expect(hmac.verifyBuffer('eval', tampered, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(false);
  });

  test('refuse un componentId différent', () => {
    const raw = Buffer.from('{}');
    const { signature, timestamp } = hmac.signBuffer('eval', raw);
    expect(hmac.verifyBuffer('other', raw, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp
    })).toBe(false);
  });

  test('refuse un timestamp expiré', () => {
    const raw = Buffer.from('{}');
    const { signature, timestamp } = hmac.signBuffer('eval', raw);
    expect(hmac.verifyBuffer('eval', raw, {
      [hmac.HMAC_HEADER]: signature,
      [hmac.HMAC_TIMESTAMP_HEADER]: timestamp - hmac.MAX_AGE_MS - 1000
    })).toBe(false);
  });

  test('la signature varie si la représentation (espaces) change (bind octets bruts)', () => {
    // Contrairement à sign() (canonique), signBuffer lie la représentation exacte.
    const ts = Date.now();
    const a = hmac.signBuffer('x', '{"a":1}', ts);
    const b = hmac.signBuffer('x', '{ "a" : 1 }', ts);
    expect(a.signature).not.toBe(b.signature);
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

  test('signMessage avec un ObjectId : verifyMessage valide après round-trip JSON', () => {
    // Cas réel : httpProvider/upload signent avec component._id (ObjectId mongo)
    // et le message est sérialisé JSON puis reparsé côté engine.
    const { ObjectId } = require('bson');
    const oid = new ObjectId('696518bec4d126b4fab958cb');
    const msg = hmac.signMessage(oid, {
      id: oid,
      queryParams: { query: {}, body: {}, headers: {}, method: 'GET' }
    });
    const roundTripped = JSON.parse(JSON.stringify(msg));
    expect(hmac.verifyMessage(roundTripped)).toBe(true);
  });
});
