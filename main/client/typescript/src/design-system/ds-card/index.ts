import { preactWrapper } from 'helpers/preact-wrapper'
import DsCard, { Props } from './ds-card'

export type DsCardProps = Props
customElements.define('ds-card', preactWrapper(DsCard, {}))