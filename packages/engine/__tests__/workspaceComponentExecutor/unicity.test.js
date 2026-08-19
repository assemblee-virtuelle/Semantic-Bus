const Unicity = require('../../workspaceComponentExecutor/unicity');

describe('Unicity - native filter translation', () => {
  test('pull groups records by unicity fields (equivalence with sift behaviour)', async () => {
    const result = await Unicity.pull(
      {
        specificData: {
          unicityFields: [{ field: 'email' }]
        }
      },
      [
        {
          data: [
            { email: 'a@x.fr', name: 'Alice' },
            { email: 'a@x.fr', name: 'Alice2' },
            { email: 'b@x.fr', name: 'Bob' }
          ]
        }
      ]
    );

    expect(result.data).toHaveLength(2);
    const aliceEntry = result.data.find(e => e.key.email === 'a@x.fr');
    expect(aliceEntry.data.name.map(v => v.value)).toEqual(['Alice', 'Alice2']);
  });

  test('pull unifies values coming from multiple records', async () => {
    const result = await Unicity.pull(
      {
        specificData: {
          unicityFields: [{ field: 'id' }]
        }
      },
      [
        {
          data: [
            { id: 1, color: 'red' },
            { id: 1, color: 'blue' },
            { id: 2, color: 'green' }
          ]
        }
      ]
    );

    expect(result.data).toHaveLength(2);
    const entry1 = result.data.find(e => e.key.id === 1);
    expect(entry1.data.color.map(v => v.value)).toEqual(['red', 'blue']);
  });

  test('pull with no unicityFields keeps each record alone with no key', async () => {
    const result = await Unicity.pull(
      {
        specificData: {}
      },
      [
        {
          data: [{ a: 1 }, { a: 2 }]
        }
      ]
    );
    expect(result.data).toHaveLength(2);
    expect(result.data[0].key).toBeUndefined();
  });

  test('pull with string records', async () => {
    const result = await Unicity.pull(
      {
        specificData: {}
      },
      [
        {
          data: ['x', 'y', 'x']
        }
      ]
    );
    // strings are kept only once thanks to the string branch
    expect(result.data).toHaveLength(2);
  });
});