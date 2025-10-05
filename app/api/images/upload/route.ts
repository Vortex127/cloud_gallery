import { NextRequest, NextResponse } from 'next/server';
import { galleryService } from '../../../../lib/services/galleryService';
import { ApiResponse } from '../../../../types/gallery';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') as string;

    // Validate required fields
    if (!file) {
      const response: ApiResponse = {
        success: false,
        message: 'No file provided',
        error: 'File is required for upload',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!title) {
      const response: ApiResponse = {
        success: false,
        message: 'Title is required',
        error: 'Title field cannot be empty',
      };
      return NextResponse.json(response, { status: 400 });
    }

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

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Prepare image data
    const imageData = {
      title: title.trim(),
      description: description?.trim() || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      isPublic: isPublic === 'true' || isPublic === '1' || isPublic === 'on',
    };

    // Create the image using the gallery service
    const createdImage = await galleryService.createImage(imageData, fileBuffer);

    const response: ApiResponse = {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: createdImage._id,
        title: createdImage.title,
        description: createdImage.description,
        cloudinaryUrl: createdImage.cloudinaryUrl,
        cloudinaryId: createdImage.cloudinaryId,
        format: createdImage.format,
        width: createdImage.width,
        height: createdImage.height,
        bytes: createdImage.bytes,
        tags: createdImage.tags,
        isPublic: createdImage.isPublic,
        createdAt: createdImage.createdAt,
        updatedAt: createdImage.updatedAt,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Upload API error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to upload image',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}