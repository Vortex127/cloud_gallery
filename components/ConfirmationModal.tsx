'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
}

interface ConfirmationModalProps extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  icon,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      onConfirm();
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'danger':
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: 'btn-danger bg-red-600 hover:bg-red-700 text-white',
          cancel: 'btn-secondary'
        };
      case 'warning':
        return {
          confirm: 'btn-warning bg-yellow-600 hover:bg-yellow-700 text-white',
          cancel: 'btn-secondary'
        };
      case 'success':
        return {
          confirm: 'btn-success bg-green-600 hover:bg-green-700 text-white',
          cancel: 'btn-secondary'
        };
      default:
        return {
          confirm: 'btn-primary bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'btn-secondary'
        };
    }
  };

  const buttonStyles = getButtonStyles();

  if (!mounted || !isOpen) {
    return null;
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible 
          ? 'bg-black/50 backdrop-blur-sm opacity-100' 
          : 'bg-black/0 opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <div className="modal-content bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 
                  dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 
                  dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-blue-500 transition-all duration-200
                  ${buttonStyles.cancel}
                `}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 transition-all duration-200
                  ${buttonStyles.confirm}
                `}
              >
                {confirmText}
              </button>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> to cancel or <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> to confirm
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Hook for using confirmation modals
export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    options: ConfirmationOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (confirmation) {
      confirmation.resolve(true);
      setConfirmation(null);
    }
  };

  const handleCancel = () => {
    if (confirmation) {
      confirmation.resolve(false);
      setConfirmation(null);
    }
  };

  const ConfirmationComponent = confirmation ? (
    <ConfirmationModal
      isOpen={confirmation.isOpen}
      {...confirmation.options}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return {
    confirm,
    ConfirmationComponent,
  };
}

// Utility function for common confirmation patterns
export const confirmations = {
  delete: (itemName: string = 'item') => ({
    title: 'Delete Confirmation',
    message: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger' as const,
  }),

  unsavedChanges: () => ({
    title: 'Unsaved Changes',
    message: 'You have unsaved changes. Are you sure you want to leave without saving?',
    confirmText: 'Leave',
    cancelText: 'Stay',
    type: 'warning' as const,
  }),

  logout: () => ({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out of your account?',
    confirmText: 'Sign Out',
    cancelText: 'Cancel',
    type: 'info' as const,
  }),

  reset: () => ({
    title: 'Reset Confirmation',
    message: 'This will reset all data to default values. Are you sure you want to continue?',
    confirmText: 'Reset',
    cancelText: 'Cancel',
    type: 'warning' as const,
  }),
};