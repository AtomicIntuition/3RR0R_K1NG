import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import AdmZip from 'adm-zip';

// Initialize Redis connection for BullMQ
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}

// Get or create scan queue
let scanQueue: Queue | null = null;
function getScanQueue() {
  if (!scanQueue) {
    const connection = getRedisConnection();
    scanQueue = new Queue('scans', { connection });
  }
  return scanQueue;
}

// Priority levels (lower = higher priority)
const PRIORITY_PRO = 1;
const PRIORITY_FREE = 5;
const PRIORITY_ANONYMOUS = 10;

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Max total extracted size: 100MB
const MAX_EXTRACTED_SIZE = 100 * 1024 * 1024;

// Max files to process
const MAX_FILES = 500;

/**
 * Check if a file is analyzable based on extension
 */
function isAnalyzableFile(path: string): boolean {
  const analyzableExtensions = [
    // JavaScript/TypeScript
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.mjs',
    '.cjs',
    // Configuration
    '.json',
    '.yaml',
    '.yml',
    '.toml',
    // Web
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    // Environment
    '.env',
    '.env.example',
    '.env.local',
    '.env.development',
    '.env.production',
    // Config files (no extension)
    '.gitignore',
    '.npmrc',
    '.nvmrc',
  ];

  // Specific filenames to include
  const analyzableFilenames = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'vite.config.ts',
    'vite.config.js',
    'webpack.config.js',
    'webpack.config.ts',
    'rollup.config.js',
    'rollup.config.ts',
    'tailwind.config.js',
    'tailwind.config.ts',
    'postcss.config.js',
    'postcss.config.mjs',
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    'babel.config.js',
    'jest.config.js',
    'jest.config.ts',
    'vitest.config.ts',
    'playwright.config.ts',
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
  ];

  const filename = path.split('/').pop() || '';
  const lowerPath = path.toLowerCase();

  // Check specific filenames
  if (analyzableFilenames.some(name => filename === name)) {
    return true;
  }

  // Check extensions
  return analyzableExtensions.some(ext => lowerPath.endsWith(ext));
}

/**
 * Check if a path should be skipped entirely
 */
function shouldSkipPath(path: string): boolean {
  const skipPatterns = [
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '.nyc_output/',
    'vendor/',
    '__pycache__/',
    '.pytest_cache/',
    '.tox/',
    'venv/',
    '.venv/',
    '.idea/',
    '.vscode/',
    '__MACOSX/',
    '.DS_Store',
  ];

  return skipPatterns.some(pattern => path.includes(pattern));
}

interface ExtractedFile {
  path: string;
  content: string;
  size: number;
}

/**
 * Extract files from a ZIP buffer
 */
function extractZip(buffer: Buffer): ExtractedFile[] {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const files: ExtractedFile[] = [];
  let totalSize = 0;

  for (const entry of entries) {
    // Skip directories
    if (entry.isDirectory) continue;

    // Skip files in excluded directories
    if (shouldSkipPath(entry.entryName)) continue;

    // Skip non-analyzable files
    if (!isAnalyzableFile(entry.entryName)) continue;

    // Skip if we've reached max files
    if (files.length >= MAX_FILES) break;

    try {
      const content = entry.getData().toString('utf8');
      const size = content.length;

      // Check total size limit
      totalSize += size;
      if (totalSize > MAX_EXTRACTED_SIZE) {
        console.warn('Extracted size limit reached');
        break;
      }

      // Skip very large individual files (likely minified/bundled)
      if (size > 1024 * 1024) {
        // 1MB per file
        console.warn(`Skipping large file: ${entry.entryName} (${size} bytes)`);
        continue;
      }

      // Clean up path (remove leading directories if all files are in same root)
      let cleanPath = entry.entryName;
      // Remove common root directory if present
      const pathParts = cleanPath.split('/');
      if (pathParts.length > 1) {
        cleanPath = pathParts.slice(1).join('/') || cleanPath;
      }

      files.push({
        path: cleanPath,
        content,
        size,
      });
    } catch (error) {
      // Skip files that can't be read as UTF-8 (binary files)
      console.warn(`Skipping binary file: ${entry.entryName}`);
      continue;
    }
  }

  return files;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const fingerprint = formData.get('fingerprint') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Get client IP for tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] ?? realIp ?? 'unknown';

    const supabase = createServiceClient();

    // Check user tier for priority queue
    let userTier: 'anonymous' | 'free' | 'pro' = 'anonymous';
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', userId)
        .single();

      if (profile?.tier) {
        userTier = profile.tier as 'anonymous' | 'free' | 'pro';
      }
    }

    // Determine job priority based on user tier
    const jobPriority =
      userTier === 'pro'
        ? PRIORITY_PRO
        : userTier === 'free'
          ? PRIORITY_FREE
          : PRIORITY_ANONYMOUS;

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedFiles: ExtractedFile[] = [];

    // Handle different file types
    if (file.name.endsWith('.zip')) {
      extractedFiles = extractZip(buffer);
    } else if (isAnalyzableFile(file.name)) {
      // Single file
      try {
        const content = buffer.toString('utf8');
        extractedFiles = [
          {
            path: file.name,
            content,
            size: content.length,
          },
        ];
      } catch {
        return NextResponse.json(
          { error: 'File must be a text file (not binary)' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: 'Unsupported file type. Upload a .zip file or a code file (.js, .ts, .json, etc.)',
        },
        { status: 400 }
      );
    }

    if (extractedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No analyzable files found in the upload' },
        { status: 400 }
      );
    }

    // Prepare file metadata for database
    const uploadedFilesMetadata = extractedFiles.map(f => ({
      path: f.path,
      size: f.size,
    }));

    // Create scan record with scan_type='upload'
    const { data: scan, error: insertError } = await supabase
      .from('scans')
      .insert({
        url: `upload://${file.name}`,
        status: 'pending',
        scan_type: 'upload',
        uploaded_files: uploadedFilesMetadata,
        ip_address: ip,
        fingerprint: fingerprint || null,
        user_id: userId || null,
      })
      .select('id')
      .single();

    if (insertError || !scan) {
      console.error('Failed to create scan:', insertError);
      return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 });
    }

    // Add job to queue with file contents
    try {
      const queue = getScanQueue();
      await queue.add(
        'scan-upload',
        {
          scanId: scan.id,
          scanType: 'upload',
          files: extractedFiles.map(f => ({ path: f.path, content: f.content })),
          userTier,
        },
        {
          jobId: scan.id,
          priority: jobPriority,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 24 * 3600,
          },
        }
      );
    } catch (queueError) {
      console.error('Failed to add job to queue:', queueError);
      await supabase
        .from('scans')
        .update({
          status: 'failed',
          error_message: 'Failed to queue scan job',
        })
        .eq('id', scan.id);

      return NextResponse.json({ error: 'Failed to queue scan' }, { status: 500 });
    }

    return NextResponse.json({
      scanId: scan.id,
      status: 'pending',
      filesCount: extractedFiles.length,
      totalSize: extractedFiles.reduce((sum, f) => sum + f.size, 0),
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
