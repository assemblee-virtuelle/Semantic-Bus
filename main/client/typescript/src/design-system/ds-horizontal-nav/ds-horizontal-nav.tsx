import {h, VNode} from 'preact'
import {style} from 'typestyle'

export type ItemProps = {
  code: string
  url?: string
  image: string
  label: string
}

export type Props = {
  items: ItemProps[]
  active: string
  onAction: (code: string) => void
}

export default function DsHorizontalNav({items, active, onAction}: Props): VNode<any> | null {
  return (
    <nav class="containerH containerNavBarTop">
      {
        items.map(item => (
          <a href={item.url} onClick={item.url === undefined ? () => onAction(item.code) : undefined}
             className={`commandButtonImage navBarTop containerV ${item.code === active ? activeItem : inactiveItem}`}>
            <img src={item.image} alt={item.label} height={40} width={40}/>
            {item.label}
            {
              item.code === active
                ? (
                  <div className="containerH arrow">
                    <div className="containerV" style="justify-content:flex-end;">
                      <div className="arrow-up" />
                    </div>
                  </div>
                )
                : undefined
            }
          </a>
        ))
      }
    </nav>
  )
}

const activeItem = style({
  backgroundColor: 'rgb(104,175,212)'
})

const inactiveItem = style({
  backgroundColor: 'rgb(124,195,232)'
})