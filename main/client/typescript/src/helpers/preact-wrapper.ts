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
      return Object.keys(properties)
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
        if (key.startsWith('on')) {
          props[key] = (data: {} | undefined) => {
            this.dispatchEvent(new PreactWrapperEvent(key.substring(2).toLowerCase(), data))
          }
        } else {
          const attributeName = getNormalizedAttributeName(key)
          props[key] = normalizeAttribute(properties, key, this.getAttribute(attributeName))
        }
      })
      return props as P
    }
  }
}