#!/bin/bash

# Vyuhaa Med Screen - EC2 Deployment Script
# Run this after cloning the repository

set -e

echo "=== Vyuhaa Med Screen Deployment ==="

# Create storage directory for large slide files
echo "Creating storage directories..."
mkdir -p storage/slides storage/reports storage/tiles storage/temp

# Set permissions
chmod -R 755 storage

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - please edit with secure passwords before production!"
fi

# Pull latest images
echo "Pulling Docker images..."
sudo docker-compose pull postgres

# Build and start services
echo "Building and starting services..."
sudo docker-compose up -d --build

# Wait for postgres to be ready
echo "Waiting for database..."
sleep 10

# Initialize passwords
echo "Initializing user passwords..."
sudo docker-compose exec -T backend node src/scripts/hashPasswords.js || true

# Show status
echo ""
echo "=== Deployment Complete ==="
sudo docker-compose ps

echo ""
echo "Access the application at: http://$(curl -s ifconfig.me)"
echo ""
echo "Default login: admin@vyuhaa.com / Password@1"
echo ""
echo "Storage location for slide images: $(pwd)/storage/slides"
echo "Maximum upload size: 3GB (supports NDPI, TIFF, SVS formats)"
