import {preactWrapper} from '../../helpers/preact-wrapper'
import {default as DsField, Props as _DsFieldProps} from './ds-field'
import {default as DsInputInteger, Props as _DsInputIntegerProps} from './ds-input-integer'
import {default as DsInputText, Props as _DsInputTextProps} from './ds-input-text'
import {boolean, ignore, number, required, string} from '../../helpers/normalizers'

export type DsFieldProps = _DsFieldProps
export type DsInputIntegerProps = _DsInputIntegerProps
export type DsInputTextProps = _DsInputTextProps

customElements.define('ds-field', preactWrapper(DsField, {
  label: required(string()),
  for: required(string()),
  children: ignore()
}))
customElements.define('ds-input-integer', preactWrapper(DsInputInteger, {
  label: required(string()),
  id: required(string()),
  value: number(),
  onUpdate: ignore(),
  readonly: boolean('readonly'),
  placeholder: string()
}))
customElements.define('ds-input-text', preactWrapper(DsInputText, {
  label: required(string()),
  id: required(string()),
  value: string(),
  onUpdate: ignore(),
  readonly: boolean('readonly'),
  placeholder: string(),
  maxlength: number()
}))