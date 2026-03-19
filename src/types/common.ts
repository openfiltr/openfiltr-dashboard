export interface ApiList<T> {
  items: T[]
  total: number
}

export type NumericBoolean = boolean | number | string | null | undefined

export interface SelectOption {
  label: string
  value: string
}
