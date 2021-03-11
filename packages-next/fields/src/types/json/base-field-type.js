import {
  JsonImplementation,
  PrismaDocumentInterface,
  KnexDocumentInterface,
  MongoDocumentInterface,
} from './Implementation';

export const JsonFieldType = {
  type: 'DocuJsonment',
  implementation: JsonImplementation,
  adapters: {
    prisma: PrismaDocumentInterface,
    knex: KnexDocumentInterface,
    mongoose: MongoDocumentInterface,
  },
};
