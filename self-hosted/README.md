# Vyuhaa Med Screen - Self-Hosted Deployment

This directory contains everything needed to run Vyuhaa Med Screen as a self-hosted application on AWS EC2 or any Docker-compatible environment.

## 📦 Stack Components

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 80 | React/Vite application served via Nginx |
| **Backend** | 3001 | Express.js REST API with JWT authentication |
| **Tile Server** | 3000 | FastAPI server for DZI slide image tiles |
| **PostgreSQL** | 5432 | Database for all application data |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- At least 4GB RAM
- 20GB+ disk space (for slide images)

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/dhritimanmallick/vyuhaa-med-screen.git
cd vyuhaa-med-screen/self-hosted

# Copy environment template and configure
cp .env.example .env
# Edit .env with your settings
```

### 2. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Initialize Passwords

After first startup, run the password hash script:

```bash
docker-compose exec backend node src/scripts/hashPasswords.js
```

### 4. Access the Application

Open http://localhost in your browser.

**Default Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vyuhaa.com | Password@1 |
| Pathologist | pathologist@vyuhaa.com | Password@1 |
| Accession | accession@vyuhaa.com | Password@1 |
| Technician | technician@vyuhaa.com | Password@1 |
| Customer | customer@vyuhaa.com | Password@1 |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the self-hosted directory:

```env
# Database
POSTGRES_USER=vyuhaa
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=vyuhaa_med

# Backend
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production

# Frontend (build-time)
VITE_API_URL=http://your-domain.com:3001
VITE_TILE_SERVER_URL=http://your-domain.com:3000
```

### Production Settings

For production deployment:

1. **Change default passwords** in `.env`
2. **Update JWT_SECRET** to a strong random string
3. **Configure SSL/TLS** using a reverse proxy (Traefik, Caddy, or nginx)
4. **Set up backups** for PostgreSQL data volume

## 🏗️ AWS EC2 Deployment

### Recommended Instance
- **Type:** t3.medium or larger
- **Storage:** 50GB+ EBS (gp3)
- **OS:** Ubuntu 22.04 LTS or Amazon Linux 2023

### Setup Steps

```bash
# 1. Install Docker
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

sudo yum install -y docker  # Amazon Linux
# or
sudo apt install -y docker.io docker-compose  # Ubuntu

sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 2. Clone and deploy
git clone https://github.com/dhritimanmallick/vyuhaa-med-screen.git
cd vyuhaa-med-screen/self-hosted

# 3. Configure and start
cp .env.example .env
nano .env  # Edit configuration

docker-compose up -d
docker-compose exec backend node src/scripts/hashPasswords.js
```

### Security Groups

Allow inbound traffic:
- **Port 80** (HTTP) - Frontend
- **Port 443** (HTTPS) - If using SSL
- **Port 22** (SSH) - Admin access only

## 📁 Directory Structure

```
self-hosted/
├── docker-compose.yml      # Main orchestration file
├── .env.example            # Environment template
├── database/
│   ├── init.sql           # Database schema
│   └── seed.sql           # Initial data
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js       # Express app entry
│       ├── db.js          # PostgreSQL connection
│       ├── middleware/
│       │   └── auth.js    # JWT authentication
│       ├── routes/        # API endpoints
│       └── scripts/       # Utility scripts
├── tile-server/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py            # FastAPI tile server
└── frontend/
    ├── Dockerfile
    └── nginx.conf         # Nginx configuration
```

## 🔧 Maintenance

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U vyuhaa vyuhaa_med > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U vyuhaa vyuhaa_med < backup_20240101.sql
```

### Update Application

```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f tile-server
```

## 📤 Uploading Slide Tiles

Place DZI tile folders in the shared storage volume:

```bash
# Access tile storage
docker-compose exec tile-server ls /app/tiles

# Copy tiles from host
docker cp ./my-slide-tiles vyuhaa-tile-server:/app/tiles/
```

Each slide should have this structure:
```
tiles/
└── slide_name/
    ├── slide_name.dzi      # DZI descriptor
    ├── regions.json        # AI annotations (optional)
    └── slide_name_files/   # Tile pyramid
        ├── 0/
        ├── 1/
        └── ...
```

## 🔒 Security Notes

- Change all default passwords before production use
- Use HTTPS in production (configure reverse proxy)
- Regularly update Docker images
- Backup data volumes regularly
- Monitor logs for suspicious activity

## 🆘 Troubleshooting

**Container won't start:**
```bash
docker-compose logs <service-name>
```

**Database connection issues:**
```bash
docker-compose exec postgres psql -U vyuhaa -d vyuhaa_med
```

**Permission denied on volumes:**
```bash
sudo chown -R 1000:1000 ./data
```

## 📞 Support

For issues specific to the self-hosted version, please create an issue on GitHub with the `self-hosted` label.
