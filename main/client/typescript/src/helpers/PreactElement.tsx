import { Component, ComponentChild, ComponentChildren, h, RenderableProps } from 'preact'

export default abstract class PreactElement<Props, State> extends Component<Props, State> {
  protected constructor(props: Props) {
    super(props)
  }

  render(props: RenderableProps<Props>, state: Readonly<State>, context: any): ComponentChild {
    // Unfortunately, with preact, we cannot return an array but always an element.
    // So as a workaround, we add the `div.host` element to be able to encapsulate things.
    // @ts-ignore
    return <div class="host">
      {this.html(props, state, context)}
    </div>
  }

  abstract html(props?: RenderableProps<Props>, state?: Readonly<State>, context?: any): ComponentChildren
}