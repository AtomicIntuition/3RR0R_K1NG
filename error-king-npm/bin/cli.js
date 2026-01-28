#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const binaryPath = path.join(__dirname, '3rror');

// Check if binary exists
if (!fs.existsSync(binaryPath)) {
  console.error('Error: 3RROR_K1NG CLI binary not found.');
  console.error('Try reinstalling: npm install -g error-king');
  process.exit(1);
}

// Forward all arguments to the binary
const args = process.argv.slice(2);
const child = spawn(binaryPath, args, {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('Failed to run 3RROR_K1NG CLI:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
