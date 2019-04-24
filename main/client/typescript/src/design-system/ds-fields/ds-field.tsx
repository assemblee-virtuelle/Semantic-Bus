import {h, VNode} from 'preact'
import {dsFiedStyle} from './styles'

export type Props = {
  label: string
  for: string
  children: VNode<any>
}

export default function DsField(props: Props): VNode<any> | null {
  return (
    <div class={dsFiedStyle}>
      <label for={props.for}>{props.label}</label>
      <div className="input-container">
        {props.children}
      </div>
    </div>
  )
}
