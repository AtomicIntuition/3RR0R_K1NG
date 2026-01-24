import 'dotenv/config';
import { Job } from 'bullmq';
import { createScanWorker, closeConnections, type ScanJobData } from './lib/queue.js';
import { runScan, closeBrowser } from './scanner.js';
import { updateScan } from './lib/supabase.js';

console.log('Starting 3RROR_K1NG Worker...');

// Process scan jobs
async function processScanJob(job: Job<ScanJobData>): Promise<void> {
  const { scanId, url } = job.data;

  console.log(`Processing job ${job.id}: ${url}`);

  try {
    await runScan(scanId, url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Job ${job.id} failed:`, errorMessage);

    // Update scan with error (might already be updated in runScan)
    try {
      await updateScan(scanId, {
        status: 'failed',
        error_message: errorMessage,
      });
    } catch {
      // Ignore if already updated
    }

    throw error;
  }
}

// Create worker
const worker = createScanWorker(processScanJob);

console.log('Worker started. Waiting for jobs...');

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down worker...');

  await worker.close();
  await closeBrowser();
  await closeConnections();

  console.log('Worker shut down complete');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Keep the process running
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
