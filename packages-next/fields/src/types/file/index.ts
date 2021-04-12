import { File, PrismaFileInterface } from './Implementation';

export default {
  type: 'File',
  implementation: File,
  adapter: PrismaFileInterface,
};
