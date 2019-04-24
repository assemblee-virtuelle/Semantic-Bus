import { preactWrapper } from 'helpers/preact-wrapper'
import DsCard, { Props } from './ds-card'
import {ignore} from '../../helpers/normalizers'

export type DsCardProps = Props
customElements.define('ds-card', preactWrapper(DsCard, {
  children: ignore()
}))