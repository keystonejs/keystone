import type { ReadStream } from 'node:fs'
import type { GraphQLScalarType } from 'graphql'
// @ts-expect-error
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'

export type FileUpload = {
  filename: string
  mimetype: string
  encoding: string
  createReadStream(): ReadStream
}

export const Upload: GraphQLScalarType<Promise<FileUpload>, {}> = GraphQLUpload
