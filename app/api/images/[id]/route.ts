import { NextRequest, NextResponse } from 'next/server';
import { galleryService } from '../../../../lib/services/galleryService';
import { ApiResponse } from '../../../../types/gallery';

// GET single image by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Image ID is required',
        error: 'Missing image ID parameter',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const image = await galleryService.getImageById(id);

    if (!image) {
      const response: ApiResponse = {
        success: false,
        message: 'Image not found',
        error: 'No image found with the provided ID',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Image retrieved successfully',
      data: image,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get image API error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve image',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT update image by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Image ID is required',
        error: 'Missing image ID parameter',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') as string;

    // Prepare update data
    const updateData: any = {};
    
    if (title !== null && title !== undefined) {
      if (title.trim().length === 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Title cannot be empty',
          error: 'Title field is required',
        };
        return NextResponse.json(response, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (description !== null && description !== undefined) {
      updateData.description = description.trim();
    }

    if (tags !== null && tags !== undefined) {
      updateData.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    }

    if (isPublic !== null && isPublic !== undefined) {
      updateData.isPublic = isPublic === 'true' || isPublic === '1' || isPublic === 'on';
    }

    let fileBuffer: Buffer | undefined;

    // If a new file is provided, validate and convert it
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid file type',
          error: 'Only image files are allowed',
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        const response: ApiResponse = {
          success: false,
          message: 'File too large',
          error: 'File size must be less than 10MB',
        };
        return NextResponse.json(response, { status: 400 });
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
    }

    // Update the image using the gallery service
    const updatedImage = await galleryService.updateImage(id, updateData, fileBuffer);

    if (!updatedImage) {
      const response: ApiResponse = {
        success: false,
        message: 'Image not found',
        error: 'No image found with the provided ID',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Image updated successfully',
      data: {
        id: updatedImage._id,
        title: updatedImage.title,
        description: updatedImage.description,
        cloudinaryUrl: updatedImage.cloudinaryUrl,
        cloudinaryId: updatedImage.cloudinaryId,
        format: updatedImage.format,
        width: updatedImage.width,
        height: updatedImage.height,
        bytes: updatedImage.bytes,
        tags: updatedImage.tags,
        isPublic: updatedImage.isPublic,
        createdAt: updatedImage.createdAt,
        updatedAt: updatedImage.updatedAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Update image API error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to update image',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE image by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Image ID is required',
        error: 'Missing image ID parameter',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const deleted = await galleryService.deleteImage(id);

    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        message: 'Image not found',
        error: 'No image found with the provided ID or deletion failed',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Image deleted successfully',
      data: { id, deleted: true },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Delete image API error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete image',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}