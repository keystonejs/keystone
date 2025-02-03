export function constructTimestamp ({
  dateValue,
  timeValue,
}: {
  dateValue: string
  timeValue: string
}) {
  return new Date(`${dateValue}T${timeValue}`).toISOString()
}

export type InnerValue = string | null

export type Value =
  | {
      kind: 'create'
      value: string | null
    }
  | {
      kind: 'update'
      value: string | null
      initial: string | null
    }
