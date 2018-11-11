<icon>
  <img src="{ image }" alt="{ label }" title="{ title }" class="{ size }"/>

  <style>
    :scope {
      display: inline;
    }

    .small {
      width: 20px;
    }

    .normal {
      width: 30px;
    }

    .big {
      width: 40px;
    }
  </style>

  <script>
    /*
     * Properties:
     * - type: string - refer to the image file name
     * - size: 'small' | 'normal' | 'big'
     * - label: string
     * - no-title: boolean
     */

    // Currently, images are split across several folders.
    // To avoid breaking the current application, we do the mapping here.
    const images = {
      ajout_composant: './image/ajout_composant.svg',
      inbox: './image/Super-Mono-png/PNG/sticker/icons/inbox.png',
      share: './image/Share.svg',
      download: './image/Super-Mono-png/PNG/sticker/icons/hard-drive-download.png'
    }
    const acceptedSizes = ['small', 'normal', 'big']
    const defaultSize = 'normal'

    this.on('updated', () => {
      this.image = normalizeImage(this.opts.type)
      this.size = normalizeSize(this.opts.size)
      this.label = this.opts.label
      this.title = this.opts.noTitle !== undefined ? undefined : this.opts.label
    })

    /**
     * @param {string} type
     * @return {string}
     */
    function normalizeImage(type) {
      return images[type] || type
    }

    /**
     * @param {string} size
     * @return {string}
     */
    function normalizeSize(size) {
      if (acceptedSizes.includes(size)) {
        return size
      } else {
        console.warn(`Unaccepted size ${size} (accepted: ${acceptedSizes.join(', ')}), fallback to ${defaultSize}`)
        return defaultSize
      }
    }
  </script>
</icon>