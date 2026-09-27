import cloudinary from '../config/cloudinary';

export interface UploadImageResult {
  url: string;
  publicId: string;
}

// Bounds how long an owner/review request can hang if Cloudinary itself is
// slow or unreachable — without this the Node SDK has no default timeout and
// the request would otherwise wait on the OS socket timeout indefinitely.
const UPLOAD_TIMEOUT_MS = 15_000;
const DELETE_TIMEOUT_MS = 8_000;

// The cloudinary package's destroy() overload omits `timeout` from its options
// type, even though the underlying API call honors it same as upload().
interface DestroyOptionsWithTimeout {
  resource_type: 'image';
  invalidate: boolean;
  timeout: number;
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
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    // The cloudinary package's .d.ts for destroy() omits `timeout`, even though
    // the underlying API call honors it same as upload() — cast narrowly rather
    // than widening the whole call to `any`.
    const options: DestroyOptionsWithTimeout = { resource_type: 'image', invalidate: true, timeout: DELETE_TIMEOUT_MS };
    const result = await cloudinary.uploader.destroy(publicId, options);
    return result.result === 'ok';
  }
}
