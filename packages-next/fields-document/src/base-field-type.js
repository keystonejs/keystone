import { DocumentImplementation, PrismaDocumentInterface } from './Implementation';

export const DocumentFieldType = {
  type: 'Document',
  implementation: DocumentImplementation,
  adapters: {
    prisma: PrismaDocumentInterface,
  },
};
