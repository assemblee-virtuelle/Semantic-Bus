'use strict';
// note google : https://developers.google.com/gmail/imap/xoauth2-protocol?hl=fr

const workspaceComponentLib = require('@semantic-bus/core/lib/workspace_component_lib');
const nodeImap = require('imap'); // Client IMAP moderne et sécurisé
const { simpleParser } = require('mailparser');

class Imap {
  constructor() {
    this.type = 'IMAP';
    this.description = 'Se connecter à une source IMAP pour récupérer des emails.';
    this.editor = 'imap-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationMessaging'
    ];
    this.mailListeners = new Map();
  }

  async connectToImap(specificData) {
    const imapConfig = {
      host: specificData.host,
      port: specificData.port,
      tls: 1
    };

    if (specificData.accessToken) {
      const xoauth2 = Buffer.from(
        `user=${specificData.username}\x01auth=Bearer ${specificData.accessToken}\x01\x01`
      ).toString('base64');

      imapConfig.xoauth2 = xoauth2;
    } else {
      imapConfig.user = specificData.user;
      imapConfig.password = specificData.password;
    }

    console.log('🔗 IMAP:', `${imapConfig.host}:${imapConfig.port}`);
    const nodeImapInstance = new nodeImap(imapConfig);

    nodeImapInstance.once('ready', () => {
      nodeImapInstance.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        // Rechercher les emails marqués comme importants
        nodeImapInstance.search([['X-GM-RAW', 'is:important']], (err, results) => {
          if (err) throw err;
          console.log('Emails importants:', results.length);
          if (results.length > 0) {
            // Inverser l'ordre des résultats pour obtenir les plus récents
            const limitedResults = results.reverse().slice(0, 10);
            const fetch = nodeImapInstance.fetch(limitedResults, { bodies: '' });
            fetch.on('message', (msg, seqno) => {
              // console.log('Message #%d', seqno);
              let emailContent = '';
              msg.on('body', (stream, info) => {
                stream.on('data', (chunk) => {
                  emailContent += chunk.toString('utf8');
                });
              });
              msg.once('end', () => {
                simpleParser(emailContent, (err, parsed) => {
                  if (err) {
                    console.error('Erreur lors de l\'analyse de l\'email:', err);
                  } else {
                    console.log('Sujet:', parsed.subject);
                    console.log('De:', parsed.from.text);
                    console.log('Corps de l\'email:', parsed.text); // ou parsed.html pour le HTML
                    console.log('--------------------------------------------------');
                  }
                });
              });
            });
            fetch.once('error', (err) => {
              console.error('Erreur lors de la récupération des emails:', err);
            });
            fetch.once('end', () => {
              console.log('Fin de la récupération des emails.');
              nodeImapInstance.end();
            });
          } else {
            console.log('Aucun email important trouvé.');
            nodeImapInstance.end();
          }
        });
      });
    });

    nodeImapInstance.once('error', (err) => {
      console.error('❌ IMAP error:', err);
    });

    nodeImapInstance.once('end', () => {
      console.log('✅ IMAP disconnected');
    });

    nodeImapInstance.once('close', () => {
      console.log('close');
    });

    nodeImapInstance.connect();
  }

  async initialise() {
    try {
      const imapComponents = await workspaceComponentLib.get_all({ type: 'IMAP' });
      // console.log('imapComponents', imapComponents);

      // for (const component of imapComponents) {
      //   await this.connectToImap(component.specificData);
      // }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des composants IMAP:', error);
    }
  }
}

module.exports = new Imap();
