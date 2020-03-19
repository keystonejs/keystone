import express from 'express';
import fs from 'fs-extra';
import nodePath from 'path';
import multer from 'multer';
import sharp from 'sharp';
import uuid from 'uuid/v4';

// https://www.npmjs.com/package/multer-sharp-s3

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

export class ImageService {
  constructor({ port = 4001, path = './images' }) {
    this.path = nodePath.resolve(path);
    this.port = port;
    this.database = new DataStore({ path: this.path });
    this.imagePath = nodePath.join(this.path, 'source');
    fs.ensureDirSync(this.imagePath);
    const upload = multer({ dest: this.imagePath });

    this.app = express();

    this.app.post('/upload', upload.single('image'), async (req, res) => {
      const image = sharp(req.file.path);
      const meta = await image.metadata();
      const id = req.file.filename + '.' + meta.format;
      await fs.rename(req.file.path, req.file.path + '.' + meta.format);
      const { size, originalname } = req.file;
      this.database.storeImage(id, {
        size,
        originalname,
        ...meta,
      });
      res.status(201).json({
        success: true,
        id,
        meta,
      });
    });

    this.app.get('/image/:id', async (req, res) => {
      const { id } = req.params;
      const filePath = nodePath.join(this.imagePath, id);
      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        return res.status(404).send('Not Found');
      }
      res.sendFile(filePath);
    });

    this.app.get('/image/:id/meta', async (req, res) => {
      const { id } = req.params;
      const data = this.database.getImage(id);

      if (!data) {
        return res.status(404).json({ error: 'not found' });
      }

      return res.json(data);
    });

    this.app.listen(port, () => {
      console.log(`🌠 KeystoneJS Image Service ready on port ${port}`);
    });
  }
}
