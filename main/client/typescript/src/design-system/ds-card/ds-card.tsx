import {h, VNode} from 'preact'
import {style} from 'typestyle'

export type Props = {
  children: VNode<any>
}

export default function DsCard({children}: Props): VNode<any> | null {
  return (
    <div className={dsCardStyles}>
      {children}
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
