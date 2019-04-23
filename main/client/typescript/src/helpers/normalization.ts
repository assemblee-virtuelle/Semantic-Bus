export type PropsNormalizer<P> = {
  [K in keyof P]: Normalizer<P[K]>
}

export type Normalizer<A> = (value: string | undefined) => A

export function getNormalizedAttributeName(attributeName: string): string {
  return attributeName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

export function getNormalizedPropName(propName: string): string {
  return propName.replace(/-[a-z]/g, (match) => `${match.toUpperCase()}`)
}

export function normalizeAttribute<P>(normalizers: PropsNormalizer<P>, name: string, value: string | undefined | null) {
  // @ts-ignore
  const normalizer: Normalizer<any> = normalizers[name]
  if (normalizer) {
    return normalizer(value === null ? undefined : value)
  } else {
    return value
  }
}