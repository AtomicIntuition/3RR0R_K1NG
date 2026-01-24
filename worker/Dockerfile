# Use Playwright's official base image which has browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Run the worker
CMD ["node", "dist/index.js"]
