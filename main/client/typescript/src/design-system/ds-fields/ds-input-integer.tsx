import {h, VNode, Component} from 'preact'
import DsField from './ds-field'
import {inputStyle} from './styles'

export type Props = {
  label: string
  id: string
  value?: number
  onUpdate?: (event: { value: number }) => void
  readonly?: boolean
  placeholder?: string
}

export default class DsInputInteger extends Component<Props> {
  public render(props: Props): VNode<any> | null {
    return (
      <DsField for={`${props.id}-field`} label={props.label}>
        <input
          type="number"
          id={`${props.id}-field`}
          value={props.value}
          onInput={this.onInput}
          readOnly={props.readonly}
          placeholder={props.placeholder}
          class={inputStyle}
        />
      </DsField>
    )
  }

  onInput = (event: Event) => {
    if (this.props.onUpdate) {
      this.props.onUpdate({value: parseInt((event.target as HTMLInputElement).value)})
    }
  }
}
