import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// Create a new Redis connection (BullMQ needs separate connections for worker and queue)
function createRedisConnection(name: string): Redis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }

  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  connection.on('error', (err) => {
    console.error(`Redis ${name} connection error:`, err);
  });

  connection.on('connect', () => {
    console.log(`Redis ${name} connected`);
  });

  return connection;
}

// Keep track of connections for cleanup
const connections: Redis[] = [];

export interface ScanJobData {
  scanId: string;
  url: string;
  userTier?: 'anonymous' | 'free' | 'pro';
}

export function createScanWorker(
  processor: (job: Job<ScanJobData>) => Promise<void>
): Worker<ScanJobData> {
  const connection = createRedisConnection('worker');
  connections.push(connection);

  const worker = new Worker<ScanJobData>('scans', processor, {
    connection,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60000,
    },
  });

  worker.on('ready', () => {
    console.log('Worker is ready and listening for jobs');
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed for scan ${job.data.scanId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  return worker;
}

export function createScanQueue(): Queue<ScanJobData> {
  const connection = createRedisConnection('queue');
  connections.push(connection);
  return new Queue<ScanJobData>('scans', { connection });
}

export async function closeConnections(): Promise<void> {
  for (const conn of connections) {
    await conn.quit();
  }
  connections.length = 0;
}
