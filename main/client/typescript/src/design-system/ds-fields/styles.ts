import {style} from 'typestyle'

export const dsFiedStyle = style({
  display: 'block',
  $nest: {
    'label': {
      display: 'block',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      marginTop: 0,
      marginBottom: '5px'
    },
    '.input-container': {
      display: 'flex',
      marginLeft: '20px'
    }
  }
})

export const inputStyle = style({
  flexGrow: 1,
  border: 'rgb(212, 212, 212) 1px solid',
  padding: '8px',
  color: 'rgb(161, 161, 161)',
  fontSize: '1rem',
  borderRadius: '2px'
})