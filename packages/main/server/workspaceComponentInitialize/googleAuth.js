'use strict';

const { OAuth2Client } = require('google-auth-library');
const workspaceComponentLib = require('@semantic-bus/core/lib/workspace_component_lib'); // Importation de la bibliothèque
const config = require('../../config.json');

class GoogleAuth {
  constructor() {
    this.type = 'Google Auth';
    this.description = 'Générer des tokens d\'authentification Google pour être réutilisés dans un flux.';
    this.editor = 'google-auth-editor';
    this.graphIcon = 'default.svg';
    this.tags = [
      'http://semantic-bus.org/data/tags/integration',
      'http://semantic-bus.org/data/tags/integrationServices',
      'http://semantic-bus.org/data/tags/utilities'
    ];
  }

  createOAuth2Client(req) {
    // Assurez-vous que l'application Express fait confiance au proxy
    req.app.set('trust proxy', true);

    const clientId = config.googleAuth.clientID;
    const clientSecret = config.googleAuth.clientSecret;
    const protocol = req.secure ? 'https' : 'http';
    // console.log('protocol', protocol);
    const redirectUri = `${protocol}://${req.get('host')}/data/specific/anonymous/google-auth/callback`;
    return new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async initialise(router) {
    router.get('/google-auth', async(req, res) => {
      console.log('ALLO');
      const componentId = req.query.componentId;
      try {
        const component = await workspaceComponentLib.get({ _id: componentId });
        console.log('component', component);
        const oAuth2Client = this.createOAuth2Client(req);
        const authorizeUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: component.specificData.selectedScopes,
          state: componentId
        });
        res.redirect(authorizeUrl);
      } catch (error) {
        res.status(500).send('Erreur lors de la récupération des informations du composant');
      }
    });

    router.get('/google-auth/callback', async(req, res) => {
      const oAuth2Client = this.createOAuth2Client(req);
      const code = req.query.code;
      const componentId = req.query.state; // Récupération du componentId depuis l'état

      try {
        const { tokens } = await oAuth2Client.getToken(code);
        // oAuth2Client.setCredentials(tokens);
        // console.info('Tokens acquired:', tokens);

        // Récupération du component pour obtenir le workspaceId
        const component = await workspaceComponentLib.get({ _id: componentId });
        const workspaceId = component.workspaceId; // Supposons que le component a un champ workspaceId

        // Mise à jour des données spécifiques du composant avec les tokens
        await workspaceComponentLib.update(
          {
            _id: componentId,
            specificData: {
              tokens: tokens,
              selectedScopes: component.specificData.selectedScopes
            }
          }
        );

        req.app.set('trust proxy', true);
        const protocol = req.secure ? 'https' : 'http';
        const host = req.get('host');
        res.redirect(`${protocol}://${host}/ihm/application.html#workspace/${workspaceId}/component/${componentId}/edit-component`);
      } catch (error) {
        res.status(500).send('Erreur lors de l\'authentification');
      }
    });
  }
}

module.exports = new GoogleAuth();
