import { preactWrapper } from '../../helpers/preact-wrapper'
import DsHorizontalNav, {ItemProps, Props} from './ds-horizontal-nav'
import {ignore, json, required, string} from '../../helpers/normalizers'

export type DsHorizontalNavProps = Props
customElements.define('ds-horizontal-nav', preactWrapper(DsHorizontalNav, {
  items: required(json<ItemProps[]>()),
  active: required(string()),
  onAction: ignore()
}))