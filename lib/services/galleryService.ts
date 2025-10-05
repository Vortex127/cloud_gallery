import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';
import { GalleryImage, CreateImageRequest, UpdateImageRequest, PaginationQuery, PaginatedResponse, DatabaseStats, SyncStatus } from '../../types/gallery';
import { uploadImage, updateImage, deleteImage, listImages } from '../cloudinary';

export class GalleryService {
  private collection: Collection<GalleryImage> | null = null;

  // Initialize the database collection
  private async getCollection(): Promise<Collection<GalleryImage>> {
    if (!this.collection) {
      const db = await getDatabase();
      this.collection = db.collection<GalleryImage>('images');
      
      // Create indexes for better performance
      await this.collection.createIndex({ cloudinaryId: 1 }, { unique: true });
      await this.collection.createIndex({ createdAt: -1 });
      await this.collection.createIndex({ tags: 1 });
      await this.collection.createIndex({ isPublic: 1 });
      await this.collection.createIndex({ title: 'text', description: 'text' });
    }
    return this.collection;
  }

  // Create a new image record
  async createImage(imageData: CreateImageRequest, file: Buffer): Promise<GalleryImage> {
    try {
      const collection = await this.getCollection();

      // Upload to Cloudinary first
      const cloudinaryResult = await uploadImage(file);

      // Create the image document
      const newImage: Omit<GalleryImage, '_id'> = {
        title: imageData.title,
        description: imageData.description || '',
        cloudinaryId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        bytes: cloudinaryResult.bytes,
        tags: imageData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: imageData.isPublic !== undefined ? imageData.isPublic : true,
      };

      // Insert into MongoDB
      const result = await collection.insertOne(newImage);
      
      if (!result.insertedId) {
        // If MongoDB insert fails, cleanup Cloudinary upload
        await deleteImage(cloudinaryResult.public_id);
        throw new Error('Failed to create image record in database');
      }

      // Return the created image with the MongoDB _id
      return {
        ...newImage,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error('Error creating image:', error);
      throw new Error(`Failed to create image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all images with pagination and filtering
  async getImages(query: PaginationQuery = {}): Promise<PaginatedResponse<GalleryImage>> {
    try {
      const collection = await this.getCollection();

      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        tags,
        isPublic,
      } = query;

      // Build the filter
      const filter: any = {};
      if (tags) {
        filter.tags = { $in: tags.split(',').map(tag => tag.trim()) };
      }
      if (isPublic !== undefined) {
        filter.isPublic = isPublic;
      }

      // Build the sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalItems = await collection.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit);

      // Get the images
      const images = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        success: true,
        message: 'Images retrieved successfully',
        data: images,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Error getting images:', error);
      throw new Error(`Failed to retrieve images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a single image by ID
  async getImageById(id: string): Promise<GalleryImage | null> {
    try {
      const collection = await this.getCollection();
      
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid image ID format');
      }

      const image = await collection.findOne({ _id: new ObjectId(id) });
      return image;
    } catch (error) {
      console.error('Error getting image by ID:', error);
      throw new Error(`Failed to retrieve image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get image by Cloudinary ID
  async getImageByCloudinaryId(cloudinaryId: string): Promise<GalleryImage | null> {
    try {
      const collection = await this.getCollection();
      const image = await collection.findOne({ cloudinaryId });
      return image;
    } catch (error) {
      console.error('Error getting image by Cloudinary ID:', error);
      throw new Error(`Failed to retrieve image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update an image
  async updateImage(id: string, updateData: UpdateImageRequest, file?: Buffer): Promise<GalleryImage | null> {
    try {
      const collection = await this.getCollection();

      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid image ID format');
      }

      const existingImage = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingImage) {
        throw new Error('Image not found');
      }

      let cloudinaryResult = null;

      // If a new file is provided, update the image in Cloudinary
      if (file) {
        cloudinaryResult = await updateImage(existingImage.cloudinaryId, file);
      }

      // Build the update object
      const updateObject: any = {
        updatedAt: new Date(),
      };

      if (updateData.title !== undefined) {
        updateObject.title = updateData.title;
      }
      if (updateData.description !== undefined) {
        updateObject.description = updateData.description;
      }
      if (updateData.tags !== undefined) {
        updateObject.tags = updateData.tags;
      }
      if (updateData.isPublic !== undefined) {
        updateObject.isPublic = updateData.isPublic;
      }

      // If Cloudinary was updated, update those fields too
      if (cloudinaryResult) {
        updateObject.cloudinaryUrl = cloudinaryResult.secure_url;
        updateObject.format = cloudinaryResult.format;
        updateObject.width = cloudinaryResult.width;
        updateObject.height = cloudinaryResult.height;
        updateObject.bytes = cloudinaryResult.bytes;
      }

      // Update the document in MongoDB
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateObject },
        { returnDocument: 'after' }
      );

      return result;
    } catch (error) {
      console.error('Error updating image:', error);
      throw new Error(`Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete an image
  async deleteImage(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();

      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid image ID format');
      }

      const existingImage = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingImage) {
        throw new Error('Image not found');
      }

      // Delete from Cloudinary first
      await deleteImage(existingImage.cloudinaryId);

      // Delete from MongoDB
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search images by text
  async searchImages(searchTerm: string, query: PaginationQuery = {}): Promise<PaginatedResponse<GalleryImage>> {
    try {
      const collection = await this.getCollection();

      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        tags,
        isPublic,
      } = query;

      // Build the filter with text search
      const filter: any = {
        $text: { $search: searchTerm },
      };

      if (tags) {
        filter.tags = { $in: tags.split(',').map(tag => tag.trim()) };
      }
      if (isPublic !== undefined) {
        filter.isPublic = isPublic;
      }

      // Build the sort object
      const sort: any = { score: { $meta: 'textScore' } };
      if (sortBy) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalItems = await collection.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit);

      // Get the images
      const images = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        success: true,
        message: 'Search completed successfully',
        data: images,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Error searching images:', error);
      throw new Error(`Failed to search images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get database statistics
  async getStats(): Promise<DatabaseStats> {
    try {
      const collection = await this.getCollection();

      const totalImages = await collection.countDocuments();
      const publicImages = await collection.countDocuments({ isPublic: true });
      const privateImages = await collection.countDocuments({ isPublic: false });

      // Get size statistics
      const sizeStats = await collection.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$bytes' },
            averageSize: { $avg: '$bytes' },
          },
        },
      ]).toArray();

      return {
        totalImages,
        publicImages,
        privateImages,
        totalSize: sizeStats[0]?.totalSize || 0,
        averageSize: Math.round(sizeStats[0]?.averageSize || 0),
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw new Error(`Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Sync with Cloudinary
  async syncWithCloudinary(): Promise<SyncStatus> {
    try {
      const collection = await this.getCollection();

      // Get MongoDB images
      const mongoImages = await collection.find({}, { projection: { cloudinaryId: 1 } }).toArray();
      const mongoCloudinaryIds = new Set(mongoImages.map(img => img.cloudinaryId));

      // Get Cloudinary images
      const cloudinaryResponse = await listImages(500); // Get up to 500 images
      const cloudinaryIds = new Set(cloudinaryResponse.resources.map((img: any) => img.public_id));

      const discrepancies: string[] = [];

      // Check for images in MongoDB but not in Cloudinary
      for (const mongoId of mongoCloudinaryIds) {
        if (!cloudinaryIds.has(mongoId)) {
          discrepancies.push(`Image ${mongoId} exists in MongoDB but not in Cloudinary`);
        }
      }

      // Check for images in Cloudinary but not in MongoDB
      for (const cloudinaryId of cloudinaryIds) {
        if (!mongoCloudinaryIds.has(cloudinaryId as string)) {
          discrepancies.push(`Image ${cloudinaryId} exists in Cloudinary but not in MongoDB`);
        }
      }

      return {
        inSync: discrepancies.length === 0,
        mongoCount: mongoImages.length,
        cloudinaryCount: cloudinaryResponse.resources.length,
        discrepancies,
      };
    } catch (error) {
      console.error('Error syncing with Cloudinary:', error);
      throw new Error(`Failed to sync with Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get images by tags
  async getImagesByTags(tags: string[]): Promise<GalleryImage[]> {
    try {
      const collection = await this.getCollection();
      const images = await collection
        .find({ tags: { $in: tags } })
        .sort({ createdAt: -1 })
        .toArray();
      return images;
    } catch (error) {
      console.error('Error getting images by tags:', error);
      throw new Error(`Failed to retrieve images by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all unique tags
  async getAllTags(): Promise<string[]> {
    try {
      const collection = await this.getCollection();
      const tags = await collection.distinct('tags');
      return tags.sort();
    } catch (error) {
      console.error('Error getting all tags:', error);
      throw new Error(`Failed to retrieve tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const galleryService = new GalleryService();