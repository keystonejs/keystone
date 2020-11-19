import {
  DocumentImplementation,
  PrismaDocumentInterface,
  KnexDocumentInterface,
  MongoDocumentInterface,
} from './Implementation';

export const DocumentFieldType = {
  type: 'Document',
  implementation: DocumentImplementation,
  adapters: {
    prisma: PrismaDocumentInterface,
    knex: KnexDocumentInterface,
    mongoose: MongoDocumentInterface,
  },
};
