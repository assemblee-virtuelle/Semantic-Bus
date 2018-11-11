(() => {
  const localStorageKey = 'i18n-language'
  const defaultLanguage = 'default'
  const authorizedLanguages = [defaultLanguage]

  /**
   * @param {string} key
   * @param {boolean} format
   */
  function translate(key, format) {
    const language = getLanguage()
    const template = window.i18n.messages[language][key]
    if (template !== undefined) {
      if (format) {
        return formatText(template)
      } else {
        return template
      }
    } else {
      return key
    }
  }

  /**
   * @return {string}
   */
  function getLanguage() {
    return localStorage.getItem(localStorageKey) || defaultLanguage
  }

  /**
   * @param {string} language
   */
  function setLanguage(language) {
    if (authorizedLanguages.includes(language)) {
      localStorage.setItem(localStorageKey, language)
    } else {
      console.warn(`Language ${language} not authorized, accepted values: ${authorizedLanguages.join(', ')}`)
    }
  }

  const strong = new RegExp("(.*)\\*\\*(.*)\\*\\*(.*)")
  const em = new RegExp("(.*)//(.*)//(.*)")
  /**
   * @param {string} text
   * @return {string}
   */
  function formatText(text) {
    if (strong.test(text)) {
      const strongResult = strong.exec(text)
      return formatText(strongResult[1]) + '<strong>' + formatText(strongResult[2]) + '</strong>' + formatText(strongResult[3])
    } else if (em.test(text)) {
      const emResult = em.exec(text)
      return formatText(emResult[1]) + '<em>' + formatText(emResult[2]) + '</em>' + formatText(emResult[3])
    } else {
      return text
    }
  }

  window.i18n = {
    ...(window.i18n || {}), // Messages are set in other files
    translate, getLanguage, setLanguage
  }
})()