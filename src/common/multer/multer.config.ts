import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const createUploadOptions = (_folder?: string) => ({
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
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
