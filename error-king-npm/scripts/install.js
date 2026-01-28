#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION = '0.1.0';
const REPO = 'AtomicIntuition/3RR0R_K1NG';
const RELEASE_TAG = 'cli-v0.1.0';

function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'darwin') {
    return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  } else if (platform === 'linux') {
    return arch === 'arm64' ? 'linux-arm64' : 'linux-x64';
  }

  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const request = (url) => {
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    };

    request(url);
  });
}

async function install() {
  try {
    const platform = getPlatform();
    const binaryName = '3rror';
    const binDir = path.join(__dirname, '..', 'bin');
    const binaryPath = path.join(binDir, binaryName);

    // Download URL from GitHub releases
    const url = `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${binaryName}-${platform}`;

    console.log(`Downloading 3RROR_K1NG CLI for ${platform}...`);

    await download(url, binaryPath);

    // Make executable
    fs.chmodSync(binaryPath, 0o755);

    console.log('3RROR_K1NG CLI installed successfully!');
    console.log('Run "3rror --help" to get started.');
  } catch (error) {
    console.error('Failed to install 3RROR_K1NG CLI:', error.message);
    console.error('');
    console.error('Alternative installation methods:');
    console.error('  - Rust: cargo install error_king');
    console.error('  - Manual: Download from https://github.com/AtomicIntuition/3RR0R_K1NG/releases');
    process.exit(1);
  }
}

install();
