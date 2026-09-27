import cloudinary from '../config/cloudinary';

export interface UploadImageResult {
  url: string;
  publicId: string;
}

export class CloudinaryIntegration {
  static async uploadImage(
    filePathOrBase64: string,
    folder = 'hotel-booking'
  ): Promise<UploadImageResult> {
    const result = await cloudinary.uploader.upload(filePathOrBase64, {
      folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      unique_filename: true,
      overwrite: false,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    return result.result === 'ok';
  }
}
