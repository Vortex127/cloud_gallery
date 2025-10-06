'use client';

import { useState, useEffect, useCallback } from 'react';
import { DatabaseStats, SyncStatus, ApiResponse } from '../types/gallery';
import { useNotify } from './Notifications';

interface GalleryStatsProps {
  refreshTrigger?: number;
}

export default function GalleryStats({ refreshTrigger }: GalleryStatsProps) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotify();

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/gallery/stats');
      const result: ApiResponse<DatabaseStats> = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.error || result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load statistics';
      setError(errorMessage);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      setSyncLoading(true);
      setError(null);
      const response = await fetch('/api/gallery/sync');
      const result: ApiResponse<SyncStatus> = await response.json();

      if (result.success && result.data) {
        setSyncStatus(result.data);
      } else {
        throw new Error(result.error || result.message || 'Failed to fetch sync status');
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sync status';
      setError(errorMessage);
    } finally {
      setSyncLoading(false);
    }
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchSyncStatus()]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefreshClick = useCallback(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSyncCheck = useCallback(() => {
    fetchSyncStatus();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadAllData();
    }
  }, [refreshTrigger, loadAllData]);

  useEffect(() => {
    if (error) {
      notify.error('Gallery Error', error);
    }
  }, [error, notify]);

  // Track if we've shown the warning for the current sync status
  const [hasShownSyncWarning, setHasShownSyncWarning] = useState(false);

  useEffect(() => {
    // Only show warning if there are discrepancies and we haven't shown it yet
    if (syncStatus && !syncStatus.inSync && syncStatus.discrepancies.length > 0 && !hasShownSyncWarning) {
      notify.warning(
        'Sync Issues Detected',
        `Found ${syncStatus.discrepancies.length} synchronization discrepancies between MongoDB and Cloudinary.`,
        { duration: 0 } // Make it stay until manually dismissed
      );
      setHasShownSyncWarning(true);
    }
    // Reset the warning flag when sync status changes to in-sync
    else if ((!syncStatus || syncStatus.inSync || syncStatus.discrepancies.length === 0) && hasShownSyncWarning) {
      setHasShownSyncWarning(false);
    }
  }, [syncStatus, notify, hasShownSyncWarning]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatCard = ({ title, value, subtitle, icon, trend, color = 'blue' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };

    return (
      <div className="card p-6 relative overflow-hidden group hover:scale-105 transition-all duration-300">
        {/* Background gradient effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-lg`}>
              {icon}
            </div>
            {trend && (
              <div className={`flex items-center text-sm font-medium ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' :
                trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {trend === 'up' && (
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                )}
                {trend === 'down' && (
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                  </svg>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Statistics</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we gather your gallery insights...</p>
        </div>
      </div>
    );
  }

  if (error && !stats && !syncStatus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Statistics</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleRefreshClick}
            className="btn-primary px-6 py-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Gallery Analytics
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Monitor your gallery performance, storage usage, and synchronization status
        </p>
        <div className="mt-8">
          <button
            onClick={handleRefreshClick}
            disabled={loading || syncLoading}
            className="btn-secondary px-6 py-3 disabled:opacity-50 inline-flex items-center"
          >
            <svg className={`w-4 h-4 mr-2 ${loading || syncLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Image Statistics */}
      {stats && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery Overview</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Images"
              value={stats.totalImages.toLocaleString()}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              color="blue"
            />

            <StatCard
              title="Public Images"
              value={stats.publicImages.toLocaleString()}
              subtitle={`${stats.totalImages > 0 ? ((stats.publicImages / stats.totalImages) * 100).toFixed(1) : 0}% of total`}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              color="green"
            />

            <StatCard
              title="Private Images"
              value={stats.privateImages.toLocaleString()}
              subtitle={`${stats.totalImages > 0 ? ((stats.privateImages / stats.totalImages) * 100).toFixed(1) : 0}% of total`}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              color="yellow"
            />

            <StatCard
              title="Total Storage"
              value={formatFileSize(stats.totalSize)}
              subtitle={`Avg: ${formatFileSize(stats.averageSize)} per image`}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              }
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Synchronization Status */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Synchronization Status</h2>
          <button
            onClick={handleSyncCheck}
            disabled={syncLoading}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 inline-flex items-center"
          >
            <svg className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Check Sync
          </button>
        </div>

        {syncLoading ? (
          <div className="card p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Checking Synchronization</h3>
              <p className="text-gray-600 dark:text-gray-400">Comparing MongoDB and Cloudinary data...</p>
            </div>
          </div>
        ) : syncStatus ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard
              title="MongoDB Count"
              value={syncStatus.mongoCount.toLocaleString()}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              }
              color="indigo"
            />

            <StatCard
              title="Cloudinary Count"
              value={syncStatus.cloudinaryCount.toLocaleString()}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="blue"
            />

            <div className={`card p-6 relative overflow-hidden ${
              syncStatus.inSync 
                ? 'border-green-200 dark:border-green-800' 
                : 'border-red-200 dark:border-red-800'
            }`}>
              <div className={`absolute inset-0 ${
                syncStatus.inSync 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 opacity-5' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 opacity-5'
              }`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    syncStatus.inSync 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    {syncStatus.inSync ? (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Sync Status
                  </h3>
                  <p className={`text-3xl font-bold mb-1 ${
                    syncStatus.inSync ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {syncStatus.inSync ? 'In Sync' : 'Issues Found'}
                  </p>
                  {!syncStatus.inSync && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {syncStatus.discrepancies.length} discrepancies detected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Discrepancies Details */}
        {syncStatus && syncStatus.discrepancies.length > 0 && (
          <div className="mt-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Synchronization Issues ({syncStatus.discrepancies.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {syncStatus.discrepancies.map((discrepancy, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-300 flex-1">
                      {discrepancy}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Recommended Actions:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Review and delete orphaned records</li>
                  <li>• Re-upload missing images if needed</li>
                  <li>• Check for network connectivity issues</li>
                  <li>• Verify API credentials are correct</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {syncStatus && syncStatus.inSync && (
          <div className="mt-8">
            <div className="card p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Perfect Synchronization!</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All images are properly synchronized between MongoDB and Cloudinary. Your gallery is in perfect harmony.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}