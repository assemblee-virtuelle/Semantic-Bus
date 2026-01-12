/**
 * @module HttpLinksStore
 * 
 * @description
 * This module manages HTTP Provider/Consumer links and their relationships.
 * It tracks which consumers reference which providers and vice versa.
 * 
 * @fires HttpLinksStore#http_links_loaded
 * @fires HttpLinksStore#ajax_fail
 * @fires HttpLinksStore#ajax_success
 */

function HttpLinksStore(utilStore) {
  riot.observable(this);
  
  this.utilStore = utilStore;
  var self = this;
  
  // Cache for HTTP links
  self.consumerLinks = {}; // consumer._id -> provider info
  self.providerLinks = {}; // provider._id -> [consumer infos]
  self.providersByUrl = {}; // path -> provider info (for URL search)
  self.loaded = false;
  
  /**
   * Load HTTP Provider/Consumer links from server
   */
  self.on('http_links_load', function() {
    self.utilStore.ajaxCall({
      method: 'GET',
      url: '/data/core/workspaces/http-links'
    }, false).then(function(data) {
      self.consumerLinks = data.consumerLinks || {};
      self.providerLinks = data.providerLinks || {};
      self.providersByUrl = data.providersByUrl || {};
      self.loaded = true;
      self.trigger('http_links_loaded', {
        consumerLinks: self.consumerLinks,
        providerLinks: self.providerLinks,
        providersByUrl: self.providersByUrl
      });
      // Also trigger providers_by_url for components that need it
      self.trigger('http_links_providers_by_url', self.providersByUrl);
    }).catch(function(error) {
      console.error('[HttpLinksStore] Failed to load HTTP links:', error);
      self.trigger('ajax_fail', 'Failed to load HTTP links');
    });
  });
  
  /**
   * Get provider info for a specific consumer component
   * @param {string} consumerComponentId - The consumer component ID
   * @returns {Object|null} Provider info or null if not linked
   */
  self.on('http_links_get_provider_for_consumer', function(consumerComponentId) {
    const providerInfo = self.consumerLinks[consumerComponentId];
    self.trigger('http_links_provider_for_consumer_result', {
      consumerComponentId: consumerComponentId,
      providerInfo: providerInfo || null
    });
  });
  
  /**
   * Get consumers for a specific provider component
   * @param {string} providerComponentId - The provider component ID
   * @returns {Array} Array of consumer infos
   */
  self.on('http_links_get_consumers_for_provider', function(providerComponentId) {
    const consumers = self.providerLinks[providerComponentId] || [];
    self.trigger('http_links_consumers_for_provider_result', {
      providerComponentId: providerComponentId,
      consumers: consumers
    });
  });
  
  /**
   * Get providers by URL (for URL search feature)
   * Returns cached data if available, otherwise triggers load
   */
  self.on('http_links_get_providers_by_url', function() {
    if (self.loaded) {
      self.trigger('http_links_providers_by_url', self.providersByUrl);
    }
    // If not loaded yet, the data will be sent when http_links_load completes
  });
  
  /**
   * Reload links from server (e.g., after component changes)
   */
  self.on('http_links_refresh', function() {
    self.trigger('http_links_load');
  });
}

if (typeof(module) !== 'undefined') module.exports = HttpLinksStore;

