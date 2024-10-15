'use strict';

const fetch = require('node-fetch'); // Assurez-vous d'avoir node-fetch installé
const querystring = require('querystring');
const config = require('../config.json'); // Importation de la configuration

module.exports = {
  /**
   * Fonction pour récupérer le token d'authentification Google.
   * @param {Object} component - Le composant contenant les données spécifiques.
   * @param {Array} dataFlow - Le flux de données.
   * @param {Object} queryParams - Les paramètres de requête.
   * @param {string} processId - L'identifiant du processus.
   * @returns {Promise<Object>} - Retourne une promesse avec le token.
   */
  pull: async function (component, dataFlow, queryParams, processId) {
    try {
      const { access_token, refresh_token } = component.specificData.tokens;

      const postData = querystring.stringify({
        client_id: config.googleAuth.clientID, // Utilisation de la config
        client_secret: config.googleAuth.clientSecret, // Utilisation de la config
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      console.log('response', response);

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data = await response.json();
      const newAccessToken = data.access_token;

      // Mettre à jour le token dans specificData
      const newExpiryDate = new Date(new Date().getTime() + (data.expires_in * 1000));
      component.specificData.tokens = {
        ...component.specificData.tokens,
        ...data
      }
      component.specificData.tokens.expiry_date = parseInt(newExpiryDate.getTime());
      component.specificData.tokens.expiry_date_iso = newExpiryDate.toISOString();
      // component.specificData.tokens.expiry_date = newExpiryDate;

      return { data: component.specificData.tokens };
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      throw error;
    }
  }
};
