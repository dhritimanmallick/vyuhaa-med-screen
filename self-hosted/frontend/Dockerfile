# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build arguments for API URLs
ARG VITE_API_URL=http://localhost:3001
ARG VITE_TILE_SERVER_URL=http://localhost:3000

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TILE_SERVER_URL=$VITE_TILE_SERVER_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
