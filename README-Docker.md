# Training Calendar - Docker Setup

This document provides instructions for running the Training Calendar application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### Production Environment

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Development Environment

1. **Build and start development services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

3. **Stop development services:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Services

### MongoDB
- **Image:** mongo:6.0
- **Port:** 27017
- **Credentials:** admin/password
- **Database:** training_calendar

### Backend (Flask)
- **Port:** 5000
- **Environment:** Production/Development
- **Features:** JWT authentication, REST API

### Frontend (React)
- **Port:** 80 (production) / 3000 (development)
- **Features:** Material-UI, React Router

## Environment Variables

### Backend
- `MONGO_URI`: MongoDB connection string
- `FLASK_ENV`: Environment (production/development)
- `FLASK_DEBUG`: Debug mode (development only)

### Frontend
- `VITE_API_URL`: Backend API URL (development only)

## Useful Commands

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Access containers
```bash
# Backend container
docker-compose exec backend bash

# Frontend container
docker-compose exec frontend sh

# MongoDB container
docker-compose exec mongodb mongosh
```

### Rebuild specific service
```bash
docker-compose build backend
docker-compose up backend
```

### Clean up
```bash
# Stop and remove containers, networks
docker-compose down

# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Development Workflow

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Make changes to your code** - the containers will automatically reload

3. **View logs for debugging:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f backend
   ```

4. **Stop development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Troubleshooting

### Port conflicts
If you get port conflicts, you can modify the port mappings in the docker-compose files:

```yaml
ports:
  - "3001:3000"  # Map host port 3001 to container port 3000
```

### MongoDB connection issues
Ensure MongoDB is running and accessible:
```bash
docker-compose logs mongodb
```

### Build issues
Clean and rebuild:
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

### Permission issues (Linux/Mac)
If you encounter permission issues:
```bash
sudo docker-compose up --build
```

## Production Deployment

For production deployment, consider:

1. **Environment variables:** Use `.env` files or environment variables
2. **Secrets management:** Use Docker secrets or external secret management
3. **SSL/TLS:** Configure reverse proxy with SSL certificates
4. **Monitoring:** Add health checks and monitoring
5. **Backup:** Configure MongoDB backups
6. **Scaling:** Use Docker Swarm or Kubernetes for scaling

## File Structure

```
TrainingCalendar/
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── .dockerignore               # Global Docker ignore
├── backend/
│   ├── Dockerfile              # Production backend image
│   ├── Dockerfile.dev          # Development backend image
│   └── .dockerignore           # Backend-specific ignore
├── frontend/
│   ├── Dockerfile              # Production frontend image
│   ├── Dockerfile.dev          # Development frontend image
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore           # Frontend-specific ignore
 