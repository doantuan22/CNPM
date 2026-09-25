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
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }
}
