export type FieldSelection<Item> = Partial<Record<keyof Item & string, true>>

type Simplify<T> = { [Key in keyof T]: T[Key] } & {}

type RequiredItemColumns<Item, Selection> = {
  [Key in keyof Item as Key extends 'id'
    ? Key
    : Key extends keyof Selection
      ? Selection[Key] extends true
        ? Key
        : never
      : never]: Item[Key]
}
type OptionalItemColumns<Item, Selection> = {
  [Key in keyof Item as Key extends 'id'
    ? never
    : Key extends keyof Selection
      ? true extends Selection[Key]
        ? Selection[Key] extends true
          ? never
          : Key
        : never
      : never]?: Item[Key]
}

export type SelectedItem<Item, Selection> = Item extends object
  ? string extends keyof Item
    ? Item
    : Simplify<RequiredItemColumns<Item, Selection> & OptionalItemColumns<Item, Selection>>
  : Item

/** Add enabled columns to a selection. False means the caller must fetch the full item.
 * Undefined entries never remove columns already required by another consumer.
 */
export function addSelection(
  select: Record<string, true>,
  fields: Readonly<Record<string, true | undefined>> | null | undefined
) {
  if (!fields) return false
  for (const [key, enabled] of Object.entries(fields)) {
    if (enabled) select[key] = true
  }
  return true
}
