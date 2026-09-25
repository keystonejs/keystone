export type FieldSelection<Item> = Partial<Record<keyof Item & string, true>>

export type SelectedItem<Item, Selection> = Item extends object
  ? string extends keyof Item
    ? Item
    : { [Key in keyof Item as Key extends keyof Selection | 'id' ? Key : never]: Item[Key] }
  : Item
