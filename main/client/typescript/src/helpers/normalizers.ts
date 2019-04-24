import { Normalizer } from './normalization'

export function required<A>(normalizer: Normalizer<A | undefined>, fallback?: A): Normalizer<A> {
  return (value: string | undefined) => {
    const normalizedValue = normalizer(value)
    if (normalizedValue === undefined) {
      if (fallback) {
        console.warn(`Attribute required but got undefined, fallback to ${fallback}`)
        return fallback
      } else {
        throw 'Attribute required but got undefined. No fallback was given'
      }
    } else {
      return normalizedValue
    }
  }
}

export function optional<A>(normalizer: (value: string) => A): Normalizer<A | undefined> {
  return (value: string | undefined) => {
    if (value === undefined) {
      return undefined
    } else {
      return normalizer(value)
    }
  }
}

export function string<A extends string>(): Normalizer<A | undefined> {
  return optional(value => value as A)
}

export function number(): Normalizer<number | undefined> {
  return optional(value => {
    const normalizedValue = Number(value)
    if (Number.isNaN(normalizedValue)) {
      console.warn(`Value ${value} is not a valid number`)
    } else {
      return Number(value)
    }
  })
}

export function enumeration<A extends string>(acceptedValues: Array<A>): Normalizer<A | undefined> {
  return optional(value => {
    if (acceptedValues.includes(value as A)) {
      return value as A
    } else {
      console.warn(`Attribute value is invalid, expected: ${acceptedValues.join(', ')}, got: ${value}.`)
      return value as A
    }
  })
}

export function boolean(keyName?: string, fallback: boolean = false): Normalizer<boolean> {
  return (value: string | undefined) => {
    if (value === undefined) {
      return fallback
    } else {
      return value === 'true' || keyName !== undefined && value === keyName
    }
  }
}


export function date(): Normalizer<Date | undefined> {
  return optional(value => {
    const normalizedDate = Date.parse(value)
    if (Number.isNaN(normalizedDate)) {
      return undefined
    } else {
      return new Date(normalizedDate)
    }
  })
}

export function json<A>(): Normalizer<A | undefined> {
  return optional(value => JSON.parse(value) as A)
}

export function ignore<A>(): Normalizer<A> {
  return required(optional(_ => _ as unknown as A))
}