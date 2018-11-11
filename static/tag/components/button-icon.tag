<button-icon>
  <button
    type="button"
    class="{ type } { state }"
    disabled={ state === "disabled" }
    title={ label }
    onclick={ onClick }
  >
    <icon type="{ icon }" size="{ iconSize }" label="{ label }" no-title></icon>
    <br/>
    <span if={ label !== undefined }>{ label }</span>
  </button>

  <style>
    button {
      background-color: transparent;
      border: none;
      text-align: center;
      cursor: pointer;
      padding: 0;
    }

    button:active, button:focus, button::-moz-focus-inner {
      border: none;
      outline: none;
    }

    button.primary {
      font-size: 19px;
      color: #fff;
      font-family: "Open Sans", serif;
      width: 100px;
    }

    button.secondary {
      font-size: 12px;
    }
  </style>

  <script>
    /*
     * Properties:
     * - type: 'primary' | 'secondary'
     * - state: 'normal' | 'disabled'
     * - icon: string
     * - label?: string
     */

    const acceptedTypes = ['primary', 'secondary']
    const defaultType = 'primary'
    const acceptedStates = ['normal', 'disabled']
    const defaultState = 'normal'

    this.on('updated', () => {
      this.type = normalizeType(this.opts.type)
      this.state = normalizeState(this.opts.state)
      this.icon = this.opts.icon
      this.iconSize = 'big'
      this.label = this.opts.label
    })

    this.onClick = (e) => {
      this.opts.onaction(e)
    }

    /**
     * @param {string} type
     * @return {string}
     */
    function normalizeType(type) {
      if (acceptedTypes.includes(type)) {
        return type
      } else {
        console.warn('Invalid type ${type} (accepted: ${acceptedTypes.join(',')}), fallback to ${defaultType}')
        return defaultType
      }
    }

    /**
     * @param {string} state
     * @return {string}
     */
    function normalizeState(state) {
      if (acceptedStates.includes(state)) {
        return state
      } else {
        console.warn('Invalid state ${state} (accepted: ${acceptedStates.join(',')}), fallback to ${defaultState}')
        return defaultState
      }
    }
  </script>
</button-icon>