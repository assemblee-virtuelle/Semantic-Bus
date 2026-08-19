const { buildAmqpUrl } = require('../../lib/amqpUrl.js');

describe('amqpUrl - construction URL AMQP avec credentials dédiés', () => {
  test('injecte les credentials STOMP dans l\'URL', () => {
    const url = buildAmqpUrl({
      socketServer: 'amqp://rabbitmq:5672',
      amqpHost: 'devLocal',
      amqpStompLogin: 'stomp-user',
      amqpStompPassword: 'secret'
    });
    expect(url).toBe('amqp://stomp-user:secret@rabbitmq:5672/devLocal');
  });

  test('fallback sur l\'URL d\'origine sans credentials', () => {
    const url = buildAmqpUrl({
      socketServer: 'amqp://rabbitmq:5672',
      amqpHost: 'devLocal'
    });
    expect(url).toBe('amqp://rabbitmq:5672/devLocal');
  });

  test('échappe les caractères spéciaux du mot de passe', () => {
    const url = buildAmqpUrl({
      socketServer: 'amqp://rabbitmq:5672',
      amqpHost: '/',
      amqpStompLogin: 'stomp-user',
      amqpStompPassword: 'p@ss w:ord'
    });
    expect(url).toBe('amqp://stomp-user:p%40ss%20w%3Aord@rabbitmq:5672/');
  });

  test('retourne chaîne vide si config absente', () => {
    expect(buildAmqpUrl()).toBe('');
  });
});
