document.addEventListener('DOMContentLoaded', (event) => {
  const i18next = window.i18next

  i18next.init({
    lng: new URLSearchParams(window.location.search).get('lang') || undefined,
    fallbackLng: 'fr',
    resources: {
      en: {
        translation: {
          workflow: {
            table: {
              status: 'STATUS',
              name: 'NAME',
              description: 'DESCRIPTION',
              modificationDate: 'MODIFICATION DATE'
            }
          }
        }
      },
      fr: {
        translation: {
          workflow: {
            table: {
              status: 'STATUS',
              name: 'NOM',
              description: 'DESCRIPTION',
              modificationDate: 'DATE DE MODIFICATION'
            }
          }
        }
      }
    }
  })
})
