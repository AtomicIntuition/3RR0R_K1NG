import 'dotenv/config';
import { Job } from 'bullmq';
import { createScanWorker, closeConnections, type ScanJobData } from './lib/queue.js';
import { runScan, runUploadScan, closeBrowser } from './scanner.js';
import { updateScan, updateMonitoredSite, recordAlert, getScan } from './lib/supabase.js';
import { sendScoreDropAlert } from './lib/email.js';

console.log('Starting Crisp Worker...');

// Process scan jobs
async function processScanJob(job: Job<ScanJobData>): Promise<void> {
  const {
    scanId,
    url,
    scanType,
    files,
    persona: rawPersona = 'professional',
    skipRoast = false,
    // Monitoring fields
    isMonitoredScan,
    monitoredSiteId,
    previousScore,
    alertOnDrop,
    alertThreshold = 10,
    userEmail,
  } = job.data;

  // Always use 'professional' persona regardless of what was sent
  const persona = 'professional' as const;

  console.log(`Processing job ${job.id}: ${scanType === 'upload' ? 'File Upload' : url} (skipRoast: ${skipRoast}, monitored: ${isMonitoredScan || false})`);

  try {
    let scanResult;

    if (scanType === 'upload' && files) {
      // Process file upload scan
      scanResult = await runUploadScan(scanId, files);
    } else if (url) {
      // Process URL scan with persona and skipRoast option
      scanResult = await runScan(scanId, url, persona, skipRoast);
    } else {
      throw new Error('Invalid job data: missing url or files');
    }

    // Handle monitored scan post-processing
    if (isMonitoredScan && monitoredSiteId && scanResult) {
      const newScore = scanResult.overallScore;
      const newGrade = scanResult.letterGrade;

      console.log(`Monitored scan complete: ${url}, score: ${newScore} (was: ${previousScore})`);

      // Update monitored site with new scan results
      await updateMonitoredSite(monitoredSiteId, {
        last_scan_id: scanId,
        last_score: newScore,
        last_grade: newGrade,
        last_scanned_at: new Date().toISOString(),
      });

      // Check if we need to send an alert
      if (
        alertOnDrop &&
        previousScore !== null &&
        previousScore !== undefined &&
        userEmail
      ) {
        const scoreDrop = previousScore - newScore;

        if (scoreDrop >= alertThreshold) {
          console.log(`Score drop detected: ${previousScore} -> ${newScore} (drop: ${scoreDrop}, threshold: ${alertThreshold})`);

          // Get the scan to find user_id
          const scan = await getScan(scanId);

          // Record the alert in the database
          await recordAlert({
            monitored_site_id: monitoredSiteId,
            user_id: scan.user_id,
            scan_id: scanId,
            old_score: previousScore,
            new_score: newScore,
            score_change: -scoreDrop,
            alert_type: 'score_drop',
          });

          // Send email alert
          await sendScoreDropAlert({
            to: userEmail,
            siteName: url ? new URL(url).hostname : 'Unknown',
            siteUrl: url || '',
            oldScore: previousScore,
            newScore,
            newGrade,
            scanId,
          });
        }
      }
    }
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
