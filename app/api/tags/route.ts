import { NextRequest, NextResponse } from 'next/server';
import { galleryService } from '../../../lib/services/galleryService';
import { ApiResponse } from '../../../types/gallery';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const tags = await galleryService.getAllTags();

    const response: ApiResponse = {
      success: true,
      message: 'Tags retrieved successfully',
      data: tags,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Tags API error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve tags',
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