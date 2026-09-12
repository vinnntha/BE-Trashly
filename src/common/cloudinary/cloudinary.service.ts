import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'trashly',
  ): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new BadRequestException(
        'Konfigurasi Cloudinary belum disetting di file .env backend (CLOUDINARY_CLOUD_NAME / API_KEY kosong).',
      );
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('File gambar tidak valid atau buffer kosong.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `trashly/${folder}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }, // Otomatis optimasi WebP & kompresi
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(
              new InternalServerErrorException(
                `Gagal mengunggah foto ke Cloudinary: ${error.message}`,
              ),
            );
          }
          if (!result?.secure_url) {
            return reject(
              new InternalServerErrorException('Gagal mendapatkan secure_url dari Cloudinary.'),
            );
          }
          resolve(result.secure_url);
        },
      );

      const readableStream = Readable.from(file.buffer);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicIdOrUrl: string): Promise<boolean> {
    try {
      if (!publicIdOrUrl) return false;
      // Jika yang dioper adalah full URL, ekstrak publicId
      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.startsWith('http')) {
        const matches = publicIdOrUrl.match(/trashly\/[^\.\/]+\/[^\.\/]+/);
        if (matches) {
          publicId = matches[0];
        }
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch {
      return false;
    }
  }
}
