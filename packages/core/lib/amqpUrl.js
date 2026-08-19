'use strict';

// -----------------------------------------------------------------------------
// amqpUrl — construction de l'URL AMQP pour les services (main, engine, timer).
//
// Les services se connectent au broker RabbitMQ. Pour utiliser un user dédié
// (ex. stomp-user) au lieu de guest/guest, on injecte les credentials
// (amqpStompLogin/amqpStompPassword de la config, surchargeables par env) dans
// l'URL socketServer.
//
// Fallback : si aucun credential n'est configuré, on renvoie l'URL d'origine
// (comportement historique, guest/guest).
// -----------------------------------------------------------------------------

function encodeCred(cred) {
  return encodeURIComponent(String(cred));
}

/**
 * Construit l'URL AMQP complète (avec credentials dédiés si configurés).
 * @param {Object} config config du service (socketServer, amqpHost, amqpStompLogin, amqpStompPassword)
 * @returns {string} URL amqp://[user:pass@]host:port/vhost
 */
function buildAmqpUrl(config) {
  if (!config) return '';
  const host = config.socketServer;
  const vhost = config.amqpHost;
  const login = config.amqpStompLogin || process.env.AMQP_STOMP_LOGIN;
  const password = config.amqpStompPassword || process.env.AMQP_STOMP_PASSWORD;

  let base = host || 'amqp://rabbitmq:5672';
  if (login && password) {
    base = base.replace(/^amqp:\/\//, `amqp://${encodeCred(login)}:${encodeCred(password)}@`);
  }
  // vhost : si déjà préfixé par '/', on l'utilise tel quel ; sinon on ajoute le séparateur.
  const vhostPath = vhost ? (vhost.startsWith('/') ? vhost : `/${vhost}`) : '/';
  return `${base}${vhostPath}`;
}

module.exports = { buildAmqpUrl };
