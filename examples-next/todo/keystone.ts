import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import { lists } from './schema';

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days
const sessionConfig = {
  maxAge: sessionMaxAge,
  secret: sessionSecret,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

export type ImageInTheDatabase = {
  mode: 'local' | 'cloud';
  // e.g 'c8cd1b99-8647-4b7e-a5d1-6693c79620a9'
  id: string;
  // source image extension
  ext: string;
  // blur hash
  // blurhash: { hash: string; x: number; y: number };
  // metadata about the source image
  filesize: number;
  width: number;
  height: number;
};

/*
type ImageResizeArgs = {
  width?: number;
  height?: number;
  strategy?: 'fit' | 'cover' | 'stretch';
};
*/
export type GraphqlImageType = {
  field: {
    mode: 'local' | 'cloud';
    // {keystone.config.publicPath}/{id}.{extension}
    src: string;
    width: number;
    height: number;
    // blurhash: { hash: string; x: number; y: number };
    extension: string;
    filesize: number;
  };
};

export default withAuth(
  config({
    db: {
      adapter: 'prisma_postgresql',
      url: process.env.DATABASE_URL || 'postgres://keystone5:k3yst0n3@localhost:5432/todo-example',
    },
    lists,
    images: {
      /* could be 'cloud' */
      mode: 'local',
      /* where images get stored when uploaded */
      uploadPath: './public/images',
      /* the basePath for where image are served from */
      publicPath: '/images',
    },
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    session: withItemData(statelessSessions(sessionConfig)),
  })
);
