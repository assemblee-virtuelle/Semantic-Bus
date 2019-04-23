import {h, VNode} from 'preact'
import {style} from 'typestyle'

export type Props = {}

export default function DsCard({}: Props): VNode<any> | null {
  return (
    <div className={dsCardStyles}>
      <slot />
    </div>
  )
}

const dsCardStyles = style({
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  padding: 15,
  backgroundColor: 'white'
})
