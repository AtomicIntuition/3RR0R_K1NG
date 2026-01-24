'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone, FileRejection } from 'react-dropzone';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-context';

interface FileUploadProps {
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ACCEPTED_FILES = {
  'application/zip': ['.zip'],
  'application/json': ['.json'],
  'text/javascript': ['.js', '.mjs', '.cjs'],
  'text/typescript': ['.ts'],
  'text/jsx': ['.jsx'],
  'text/tsx': ['.tsx'],
  'text/yaml': ['.yaml', '.yml'],
  'text/plain': ['.env', '.txt'],
};

export function FileUpload({ className }: FileUploadProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState('');
  const [error, setError] = useState('');
  const [uploadStats, setUploadStats] = useState<{ filesCount: number; totalSize: number } | null>(
    null
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError('');
      setUploadStats(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Upload a .zip file or code files (.js, .ts, .json, etc.)');
        } else {
          setError(rejection.errors[0]?.message || 'Invalid file');
        }
        return;
      }

      if (acceptedFiles.length === 0) {
        setError('No valid files selected');
        return;
      }

      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadPhase('Uploading file...');

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (user?.id) {
          formData.append('userId', user.id);
        }

        setUploadPhase('Processing upload...');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setUploadStats({
          filesCount: data.filesCount,
          totalSize: data.totalSize,
        });

        setUploadPhase(`Found ${data.filesCount} files. Redirecting...`);

        // Navigate to results page
        setTimeout(() => {
          router.push(`/scan/${data.scanId}`);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setIsUploading(false);
        setUploadPhase('');
      }
    },
    [router, user]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className={clsx('w-full max-w-2xl mx-auto', className)}>
      {/* Terminal-style header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-void-100 rounded-t-lg border border-b-0 border-void-200">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-danger/80" />
          <span className="w-3 h-3 rounded-full bg-neon-yellow/80" />
          <span className="w-3 h-3 rounded-full bg-terminal/80" />
        </div>
        <span className="text-xs text-gray-400 ml-2">code_analyzer.exe</span>
      </div>

      {/* Dropzone container */}
      <div
        {...getRootProps()}
        className={clsx(
          'relative bg-void-50 border border-void-200 rounded-b-lg overflow-hidden',
          'cursor-pointer transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-terminal/50',
          isDragActive && !isDragReject && 'border-terminal bg-terminal/5',
          isDragReject && 'border-danger bg-danger/5',
          isUploading && 'opacity-75 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <div className="p-8 text-center">
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg className="animate-spin h-10 w-10 text-terminal" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-terminal font-mono">{uploadPhase}</p>
              {uploadStats && (
                <p className="text-sm text-gray-400">
                  {uploadStats.filesCount} files ({(uploadStats.totalSize / 1024).toFixed(1)} KB)
                </p>
              )}
              <div className="h-1 bg-void-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-terminal animate-pulse w-2/3" />
              </div>
            </div>
          ) : (
            <>
              {/* Upload icon */}
              <div className="mb-4">
                <svg
                  className={clsx(
                    'w-16 h-16 mx-auto transition-colors',
                    isDragActive ? 'text-terminal' : 'text-gray-500'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              {isDragActive ? (
                <p className="text-terminal font-mono text-lg">
                  {isDragReject ? 'Invalid file type!' : 'Drop files here...'}
                </p>
              ) : (
                <>
                  <p className="text-gray-200 mb-2 text-lg">
                    Drag & drop your project ZIP or code files
                  </p>
                  <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2 py-1 text-xs bg-void-200 rounded text-gray-400">
                      .zip
                    </span>
                    <span className="px-2 py-1 text-xs bg-void-200 rounded text-gray-400">
                      package.json
                    </span>
                    <span className="px-2 py-1 text-xs bg-void-200 rounded text-gray-400">
                      .js / .ts
                    </span>
                    <span className="px-2 py-1 text-xs bg-void-200 rounded text-gray-400">
                      .jsx / .tsx
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 px-4 py-2 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
          <span className="font-bold">ERROR:</span> {error}
        </div>
      )}

      {/* Info section */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 mb-2">What we analyze:</p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="px-3 py-1 bg-void-100 rounded border border-void-200 text-gray-400">
            Dependency vulnerabilities
          </span>
          <span className="px-3 py-1 bg-void-100 rounded border border-void-200 text-gray-400">
            Exposed secrets
          </span>
          <span className="px-3 py-1 bg-void-100 rounded border border-void-200 text-gray-400">
            Code patterns
          </span>
        </div>
      </div>
    </div>
  );
}
