FROM node:18-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install all dependencies (not --production, we need tsc to build)
RUN npm install

# Copy rest of the source code
COPY . .

# Build TypeScript into dist/
RUN npm run build

# Expose service port (change if booking-service uses 4001)
EXPOSE 4000

# Run compiled JS, not ts-node-dev
CMD ["npm", "run", "start"]
