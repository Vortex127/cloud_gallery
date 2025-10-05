import { NextRequest, NextResponse } from 'next/server';
import { galleryService } from '../../../lib/services/galleryService';
import { ApiResponse, PaginationQuery } from '../../../types/gallery';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query: PaginationQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'title') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      tags: searchParams.get('tags') || undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
    };

    // Validate pagination parameters
    if (query.page! < 1) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid page number',
        error: 'Page number must be greater than 0',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (query.limit! < 1 || query.limit! > 100) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid limit',
        error: 'Limit must be between 1 and 100',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check for search query
    const searchTerm = searchParams.get('search');
    
    let result;
    if (searchTerm) {
      // Perform text search
      result = await galleryService.searchImages(searchTerm, query);
    } else {
      // Get all images with filters
      result = await galleryService.getImages(query);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Get images API error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve images',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}