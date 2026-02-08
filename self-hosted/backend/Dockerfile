FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create storage directory
RUN mkdir -p /app/storage

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
