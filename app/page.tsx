'use client';

import { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import Gallery from '../components/Gallery';
import GalleryStats from '../components/GalleryStats';
import { useNotify } from '../components/Notifications';
import { GalleryImage } from '../types/gallery';

type ActiveTab = 'gallery' | 'upload' | 'stats';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const notify = useNotify();

  const handleUploadSuccess = (image: any) => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('gallery'); // Switch to gallery after upload
    notify.success(
      'Upload Successful!',
      `${image.title} has been uploaded to your gallery.`
    );
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    notify.error('Upload Failed', error);
  };

  const handleImageSelect = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleImageDelete = (imageId: string) => {
    setRefreshTrigger(prev => prev + 1);
    if (selectedImage && selectedImage._id?.toString() === imageId) {
      setSelectedImage(null);
    }
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const TabButton = ({ tab, label, icon, isActive, onClick }: {
    tab: ActiveTab;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
        ${isActive
          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg border-2 border-blue-200 dark:border-blue-800'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  Cloud Gallery
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Professional Image Management System
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl p-1 backdrop-blur-sm">
              <TabButton
                tab="gallery"
                label="Gallery"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                isActive={activeTab === 'gallery'}
                onClick={() => setActiveTab('gallery')}
              />
              <TabButton
                tab="upload"
                label="Upload"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                }
                isActive={activeTab === 'upload'}
                onClick={() => setActiveTab('upload')}
              />
              <TabButton
                tab="stats"
                label="Statistics"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                isActive={activeTab === 'stats'}
                onClick={() => setActiveTab('stats')}
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 py-12">
          {activeTab === 'gallery' && (
            <Gallery
              onImageSelect={handleImageSelect}
              onImageDelete={handleImageDelete}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'upload' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ImageUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}
          
          {activeTab === 'stats' && (
            <GalleryStats refreshTrigger={refreshTrigger} />
          )}
        </div>
      </main>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-white dark:bg-gray-900 max-w-6xl max-h-[90vh] w-full overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedImage.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(selectedImage.createdAt)} • {formatFileSize(selectedImage.bytes)}
                </p>
              </div>
              <button
                onClick={closeImageModal}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Display */}
                <div className="space-y-6">
                  <div className="relative group">
                    <img
                      src={selectedImage.cloudinaryUrl}
                      alt={selectedImage.title}
                      className="w-full h-auto rounded-2xl shadow-2xl max-h-[70vh] object-contain bg-gray-50 dark:bg-gray-800"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <a
                      href={selectedImage.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary px-6 py-3 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Full Size
                    </a>
                    <button
                      onClick={() => {
                        handleImageDelete(selectedImage._id?.toString() || '');
                        closeImageModal();
                      }}
                      className="btn-danger px-6 py-3 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Image
                    </button>
                  </div>
                </div>
                
                {/* Image Details */}
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Image Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedImage.width} × {selectedImage.height}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Format:</span>
                        <p className="font-medium text-gray-900 dark:text-white uppercase">{selectedImage.format}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">File Size:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatFileSize(selectedImage.bytes)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Visibility:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedImage.isPublic 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {selectedImage.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedImage.description && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m-2-6v12" />
                        </svg>
                        Description
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedImage.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedImage.tags.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm px-3 py-1 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Info */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Technical Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Cloudinary ID:</span>
                        <p className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                          {selectedImage.cloudinaryId}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">MongoDB ID:</span>
                        <p className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                          {selectedImage._id?.toString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedImage.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedImage.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Cloud Gallery</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">MongoDB & Cloudinary Integration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Next.js 15</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cloudinary</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span>MongoDB</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}