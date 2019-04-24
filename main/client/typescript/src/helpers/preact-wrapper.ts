import {getNormalizedAttributeName, normalizeAttribute, PropsNormalizer} from './normalization'
import {ComponentFactory, h, render} from 'preact'

class PreactWrapperEvent extends Event {
  public readonly data: {} | undefined

  public constructor(code: string, data: {} | undefined) {
    super(code)
    this.data = data
  }
}

export function preactWrapper<P>(preactComponent: ComponentFactory<P>, properties: PropsNormalizer<P>) {
  return class extends HTMLElement {
    private currentElement: Element | undefined

    constructor() {
      super()
    }

    static get observedAttributes() {
      const keys = Object.keys(properties)
      return [...keys, ...keys.map(key => `x-${key}`)]
    }

    connectedCallback() {
      this.render()
    }

    attributeChangedCallback() {
      this.render()
    }

    render() {
      if (this.isConnected) {
        this.currentElement = render(h(preactComponent, this.getProps()), this, this.currentElement)
      }
    }

    getProps() {
      const props: any = {}
      Object.keys(properties).forEach(key => {
        if (key === 'children') {
          // ignore
        } else if (key.startsWith('on')) {
          props[key] = (data: {} | undefined) => {
            this.dispatchEvent(new PreactWrapperEvent(key.substring(2).toLowerCase(), data))
          }
        } else {
          const attributeName = getNormalizedAttributeName(key)
          const rawValue = this.hasAttribute(attributeName) ? this.getAttribute(attributeName) : this.getAttribute(`x-${attributeName}`)
          props[key] = normalizeAttribute(properties, key, rawValue)
        }
      })
      return props as P
    }
  }
}