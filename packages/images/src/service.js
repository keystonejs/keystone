import express from 'express';
import fs from 'fs-extra';
import nodePath from 'path';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import uuid from 'uuid/v4';

// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.jpeg
// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.png
// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.jpeg?width=200&height=100&fit=cover
// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.jpeg?width=200&height=100&fit=contain
// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.jpeg?width=200&height=100&fit=cover
// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.jpeg?width=200&fit=cover
// http://localhost:4008/image/5d5a561875a3821da888fe2570d910ea.jpeg?height=200&fit=cover

const VALID_FIT_TYPES = ['cover', 'contain', 'fill', 'inside', 'outside'];

class DataStore {
  constructor({ path }) {
    this.jsonPath = `${path}/data.json`;
    try {
      this.data = fs.readJsonSync(this.jsonPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.data = {};
      } else {
        throw err;
      }
    }
  }
  storeImage(id, meta) {
    this.data[id] = meta;
    fs.outputJSONSync(this.jsonPath, this.data);
  }
  getImage(id) {
    return this.data[id];
  }
}

const processResizeOptions = ({ width, height, fit = 'cover' }) => {
  if (!width && !height) {
    return null;
  }
  if (!VALID_FIT_TYPES.includes(fit)) {
    return {
      error: `Invalid fit option; can be one of ${VALID_FIT_TYPES.join(', ')}.`,
    };
  }
  const widthInt = parseInt(width, 10);
  const heightInt = parseInt(height, 10);

  if (width && (isNaN(widthInt) || widthInt < 1)) {
    return {
      error: `Invalid width. Please provide a positive integer`,
    };
  }

  if (height && (isNaN(heightInt) || heightInt < 1)) {
    return {
      error: `Invalid height. Please provide a positive integer`,
    };
  }

  return { width: widthInt || undefined, height: heightInt || undefined, fit };
};

export class ImageService {
  constructor({ port = 4001, protocol = 'http', host = 'localhost', path = './images' }) {
    this.path = nodePath.resolve(path);
    this.protocol = protocol;
    this.port = port;
    this.host = host;
    this.database = new DataStore({ path: this.path });
    this.sourcePath = nodePath.join(this.path, 'source');
    this.transformsPath = nodePath.join(this.path, 'transforms');
    fs.ensureDirSync(this.sourcePath);
    fs.ensureDirSync(this.transformsPath);

    const upload = multer({ dest: this.sourcePath });

    this.app = express();

    this.app.post('/upload', upload.single('image'), async (req, res) => {
      const { originalname, path } = req.file;

      res.status(201).json(this.storeImageInDatabase({ path, originalname }));
    });

    this.app.get('/image/:filename', async (req, res) => {
      const { filename } = req.params;
      const [id, format] = filename.split('.');

      if (!id || !format) {
        return res.status(404).send('Not Found (Invalid Filename)');
      }

      const data = this.database.getImage(id);

      if (!data) {
        return res.status(404).send('Not Found (No Matching Image)');
      }

      const originalPath = nodePath.join(this.sourcePath, `${id}.${data.format}`);
      const resizeOptions = processResizeOptions(req.query);

      if (!resizeOptions && format === data.format) {
        return res.sendFile(originalPath);
      }

      let suffix = '';

      if (resizeOptions) {
        if (resizeOptions.error) {
          return res.status(400).send(resizeOptions.error);
        }

        const md5sum = crypto.createHash('md5');
        md5sum.update(JSON.stringify(resizeOptions));
        const hash = md5sum.digest('hex');

        suffix = `-${hash}`;
      }

      let transformedFilename = nodePath.join(this.transformsPath, `${id}${suffix}.${format}`);

      if (!(await fs.exists(transformedFilename))) {
        try {
          const sharpImage = sharp(originalPath);
          if (resizeOptions) {
            await sharpImage.resize(resizeOptions);
          }
          await sharpImage.toFile(transformedFilename);
        } catch (err) {
          console.error(err);
          return res.status(500).send({ error: 'Internal server error' });
        }
      }

      res.sendFile(transformedFilename);
    });

    this.app.get('/image/:id/meta', async (req, res) => {
      const { id } = req.params;
      const data = this.database.getImage(id);

      if (!data) {
        return res.status(404).json({ error: 'not found' });
      }

      res.json(data);
    });

    this.app.listen(port, () => {
      console.log(`🌠 KeystoneJS Image Service ready on port ${port}`);
    });
  }
  getSrc(id, { format, resize = {} }) {
    let url = `${this.protocol}://${this.host}:${this.port}/image/${id}.${format}`;

    let searchParams = new URLSearchParams();
    for (let key in resize) {
      searchParams.set(key, resize[key]);
    }

    let stringifiedSearchParams = searchParams.toString();
    if (stringifiedSearchParams) {
      url += `?${stringifiedSearchParams}`;
    }
    return url;
  }
  async uploadImage({ stream, originalname }) {
    const id = uuid();
    const path = nodePath.join(this.sourcePath, id);
    const writeStream = fs.createWriteStream(path);
    stream.pipe(writeStream);
    await new Promise(resolve => stream.on('end', resolve));
    return this.storeImageInDatabase({ path, originalname });
  }
  async storeImageInDatabase({ path, originalname }) {
    const filename = nodePath.basename(path);
    const image = sharp(path);
    const meta = await image.metadata();
    const id = filename;
    const { size } = await fs.stat(path);
    await fs.rename(path, path + '.' + meta.format);
    this.database.storeImage(id, {
      size,
      originalname,
      ...meta,
    });

    return {
      success: true,
      id,
      meta,
    };
  }
}
