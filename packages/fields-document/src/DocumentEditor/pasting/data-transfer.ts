// jsdom doesn't provide a DataTransfer polyfill
// https://html.spec.whatwg.org/multipage/dnd.html#datatransfer
export class MyDataTransfer implements DataTransfer {
  #data = new Map<string, string>()
  dropEffect = 'none' as const
  effectAllowed = 'none' as const
  setData(format: string, data: string) {
    this.#data.set(getNormalizedFormat(format), data)
  }
  clearData(format?: string) {
    if (format === undefined) {
      this.#data.clear()
    } else {
      this.#data.delete(getNormalizedFormat(format))
    }
  }
  getData(format: string) {
    return this.#data.get(getNormalizedFormat(format)) || ''
  }
  get types() {
    return Object.freeze([...this.#data.keys()])
  }
  setDragImage(): never {
    throw new Error('DataTransfer#setDragImage is currently unimplemented')
  }
  get files(): never {
    throw new Error('DataTransfer#files is currently unimplemented')
  }
  get items(): never {
    throw new Error('DataTransfer#items is currently unimplemented')
  }
}

function getNormalizedFormat(format: string) {
  const lowercased = format.toLowerCase()
  if (lowercased === 'text') {
    return 'text/plain'
  }
  if (lowercased === 'url' || lowercased === 'text/uri-list') {
    throw new Error('text/uri-list is currently unimplemented')
  }
  return lowercased
}
