import { diskStorage } from 'multer';
import { extname } from 'path';

export const storageOptions = {
  storage: diskStorage({
    destination: './assets',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
};
