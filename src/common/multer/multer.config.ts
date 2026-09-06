import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export const createUploadOptions = (folder: string) => ({
  storage: diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = `./uploads/${folder}`;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = crypto.randomUUID();
      const fileExt = extname(file.originalname).toLowerCase();
      callback(null, `${uniqueSuffix}${fileExt}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('Format foto hanya boleh JPG, PNG, atau WebP'),
        false,
      );
    }
    callback(null, true);
  },
});

export const nasabahUploadOptions = createUploadOptions('nasabah');
export const kategoriUploadOptions = createUploadOptions('kategori');
export const hadiahUploadOptions = createUploadOptions('hadiah');
export const adminUploadOptions = createUploadOptions('admin');
