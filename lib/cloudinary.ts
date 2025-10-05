import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export async function uploadImage(file: Buffer, publicId?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: 'image',
      folder: 'gallery',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(file);
  });
}

// Update image in Cloudinary
export async function updateImage(publicId: string, file: Buffer): Promise<any> {
  try {
    // Delete the old image
    await deleteImage(publicId);
    // Upload the new image with the same public_id
    return await uploadImage(file, publicId);
  } catch (error) {
    console.error('Cloudinary update error:', error);
    throw error;
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

// Get image details from Cloudinary
export async function getImageDetails(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary get details error:', error);
    throw error;
  }
}

// List all images in the gallery folder
export async function listImages(maxResults: number = 50): Promise<any> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'gallery',
      max_results: maxResults,
      resource_type: 'image',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary list images error:', error);
    throw error;
  }
}

export default cloudinary;