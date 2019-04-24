import {h, VNode, Component} from 'preact'
import DsField from './ds-field'
import {inputStyle} from './styles'

export type Props = {
  label: string
  id: string
  value?: string
  onUpdate?: (event: { value: string }) => void
  readonly?: boolean
  placeholder?: string
  maxlength?: number
}

export default class DsInputText extends Component<Props> {
  public constructor(props: Props) {
    super(props)
  }

  public render(props: Props): VNode<any> | null {
    return (
      <DsField for={`${props.id}-field`} label={props.label}>
        <input
          type="text"
          id={`${props.id}-field`}
          value={props.value}
          onInput={this.onInput}
          readOnly={props.readonly}
          placeholder={props.placeholder}
          maxLength={props.maxlength}
          class={inputStyle}
        />
      </DsField>
    )
  }

  onInput = (event: Event) => {
    if (this.props.onUpdate) {
      this.props.onUpdate({value: (event.target as HTMLInputElement).value})
    }
  }
}
