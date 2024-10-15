'use strict';

const nodeImap = require('node-imap');
const { simpleParser } = require('mailparser');
const stringReplacer = require('../utils/stringReplacer.js'); // Importation de stringReplacer

class ImapExecutor {
  constructor() {
    this.stringReplacer = stringReplacer; // Initialisation de stringReplacer
  }

  connectToImap(specificData, flowData) { // Ajout de flowData comme paramètre
    return new Promise((resolve, reject) => {
      const imapConfig = {
        host: specificData.host,
        port: specificData.port,
        tls: specificData.tls
      };

      let accessToken = specificData.accessToken;
      // console.log('accessToken', accessToken,flowData[0].data);
      if (accessToken) {
        accessToken = this.stringReplacer.execute(accessToken,undefined, flowData ? flowData[0].data : undefined,true);
      }
      // console.log('accessToken', accessToken);

      if (accessToken) {
        const xoauth2 = Buffer.from(
          `user=${specificData.username}\x01auth=Bearer ${accessToken}\x01\x01`
        ).toString('base64');
        imapConfig.xoauth2 = xoauth2;
      } else {
        imapConfig.user = specificData.username;
        imapConfig.password = specificData.password;
      }

      // console.log('imapConfig', imapConfig);

      const imap = new nodeImap(imapConfig);

      imap.once('ready', () => {
        const messages = [];
        imap.openBox(specificData.mailbox || 'INBOX', false, (err, box) => {
          if (err) return reject(err);

          const searchCriteria = specificData.searchFilter ? [specificData.searchFilter] : [['X-GM-RAW', 'is:important'], 'UNSEEN'];
          imap.search(searchCriteria, (err, results) => {
            if (err) return reject(err);

            if (results.length > 0) {
                // console.log('results number', results.length);
                const limitedResults = results.reverse().slice(0, 100);
                const fetch = imap.fetch(limitedResults, { bodies: '' });

                fetch.on('message', (msg, seqno) => {
                    let emailContent = '';
                    msg.on('body', (stream) => {
                        stream.on('data', (chunk) => {
                            emailContent += chunk.toString('utf8');
                        });
                    });
                    msg.once('end', () => {
                        simpleParser(emailContent, (err, parsed) => {
                            if (err) {
                                console.error('Erreur lors de l\'analyse de l\'email:', err);
                                messages.push({
                                    subject: 'Erreur lors de l\'analyse de l\'email',
                                    from: 'Erreur lors de l\'analyse de l\'email',
                                    text: err
                                });
                            } else {
                                const fromAddress = parsed.from.value.map(addr => addr.address).join(', '); // Extraction de l'adresse email
                                messages.push({
                                    subject: parsed.subject,
                                    from: fromAddress, // Utilisation de l'adresse email exacte
                                    date: parsed.date,
                                    text: parsed.text,
                                    html: parsed.html
                                });
                                messages.sort((a, b) => new Date(b.date) - new Date(a.date));
                                // console.log('messages', messages.length);
                            }
                            if (messages.length >= limitedResults.length) {
                                resolve(messages);
                            }
                        });
                    });
                });
              fetch.once('error', (err) => {
                console.error('Erreur lors de la récupération des emails:', err);
              });
              fetch.once('end', () => {
                // console.log('Fin de la récupération des emails.');
                imap.end();
                // resolve(messages);
              });
            } else {
              // console.log('Aucun email trouvé.');
              imap.end();
            }
          });
        });
      });

      imap.once('error', (err) => {
        console.error('IMAP connection error: ', err);
        reject(err);
      });

      imap.once('end', () => {
        // console.log('IMAP connection ended');
        // resolve();
      });

      imap.connect();
    });
  }

  pull(data, flowData) {
    return new Promise(async (resolve, reject) => {
      try {
        const specificData = data.specificData;
        const messages = await this.connectToImap(specificData, flowData); // Passage de flowData
        resolve({ data: messages });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ImapExecutor();
