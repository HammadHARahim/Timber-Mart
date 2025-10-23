# Timber Mart CRM - Management Scripts

Enhanced bash scripts for managing the Timber Mart CRM services with powerful features, health checks, and multiple fallback methods.

## Available Scripts

### 🚀 start.sh - Production Start
Starts both backend and frontend servers in production mode with health checks.

```bash
./start.sh
```

**Features:**
- Automatic dependency installation
- Port conflict detection and cleanup
- Health check verification (waits for services to be healthy)
- Process monitoring
- PID file management
- Live log tailing
- Graceful error handling

**What it does:**
1. Checks Node.js and npm installation
2. Installs missing dependencies
3. Kills any existing processes on ports 5001 and 5173
4. Starts backend server (Port 5001)
5. Waits for backend health check to pass
6. Starts frontend client (Port 5173)
7. Waits for frontend to be accessible
8. Shows live logs from both services

**Output:**
- Backend: http://localhost:5001
- Frontend: http://localhost:5173
- Health: http://localhost:5001/api/health

---

### 🔧 start-dev.sh - Development Mode
Starts services in separate terminal windows for easy debugging.

```bash
./start-dev.sh
```

**Features:**
- Opens separate terminal windows for backend and frontend
- Supports multiple terminal emulators (gnome-terminal, konsole, xfce4-terminal, xterm)
- Automatic fallback to production mode if no terminal emulator found
- Uses nodemon for backend (auto-restart on changes)
- Uses Vite dev server for frontend (Hot Module Replacement)
- Port availability verification

**Supported Terminals:**
- GNOME Terminal
- KDE Konsole
- XFCE Terminal
- XTerm

**Development Features:**
- Hot Module Replacement (HMR)
- Auto-restart on file changes
- Detailed error messages
- Source maps enabled

---

### 🛑 stop.sh - Powerful Stop Script
Stops all services using multiple fallback methods.

```bash
# Graceful stop
./stop.sh

# Force kill (immediate)
./stop.sh --force

# Show help
./stop.sh --help
```

**Features:**
- 4 methods of stopping processes (cascading fallback)
- Graceful shutdown with SIGTERM
- Force kill with SIGKILL as fallback
- Port-based cleanup
- Process pattern matching
- Nuclear option (force mode only)
- Verification of cleanup
- Optional log file clearing

**Stop Methods:**
1. **Method 1:** Kill by PID files (`.backend.pid`, `.frontend.pid`)
2. **Method 2:** Kill by port numbers (5001, 5173)
3. **Method 3:** Kill by process name patterns
4. **Method 4:** Nuclear cleanup (force mode only)

**Options:**
- `-f, --force` - Force kill all processes immediately
- `-h, --help` - Show help message

**Graceful Stop:**
- Sends SIGTERM signal
- Waits up to 5 seconds
- Falls back to SIGKILL if needed

---

### 📊 status.sh - Service Status Check
Comprehensive status check for all services.

```bash
./status.sh
```

**Features:**
- System information (Node.js, npm versions)
- Backend status and health check
- Frontend status and connectivity check
- Process information (PID, CPU, MEM, uptime)
- Dependency verification
- Log file information
- Overall status summary
- Quick action suggestions

**Status Information:**
- ✅ Service running and healthy
- ⚠️  Service partially running
- ❌ Service not running
- Stale PID file detection
- Resource usage (CPU, Memory)
- Process uptime

---

## Quick Reference

### Starting Services

```bash
# Production mode (single terminal, logs tailing)
./start.sh

# Development mode (separate terminals, auto-reload)
./start-dev.sh
```

### Stopping Services

```bash
# Graceful stop (recommended)
./stop.sh

# Force stop (immediate kill)
./stop.sh --force
```

### Checking Status

```bash
# Check if services are running
./status.sh
```

### Viewing Logs

```bash
# View backend logs
tail -f logs/backend.log

# View frontend logs
tail -f logs/frontend.log

# View both logs
tail -f logs/backend.log logs/frontend.log
```

---

## Port Configuration

| Service  | Port | URL |
|----------|------|-----|
| Backend  | 5001 | http://localhost:5001 |
| Frontend | 5173 | http://localhost:5173 |

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the ports
lsof -i :5001
lsof -i :5173

# Stop all services
./stop.sh --force

# Start again
./start.sh
```

### Services Won't Start

1. Check status:
```bash
./status.sh
```

2. Check logs:
```bash
tail -50 logs/backend.log
tail -50 logs/frontend.log
```

3. Reinstall dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

4. Force stop and restart:
```bash
./stop.sh --force
./start.sh
```

### Stale PID Files

If you see "stale PID file" warnings:

```bash
# Clean up manually
rm -f .backend.pid .frontend.pid

# Or use force stop
./stop.sh --force
```

### Services Not Stopping

Use force mode:

```bash
./stop.sh --force
```

Manual cleanup:

```bash
# Kill by port
lsof -ti:5001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Kill by pattern
pkill -9 -f "node.*server.js"
pkill -9 -f "vite"
```

---

## Advanced Usage

### Custom Port Configuration

Edit the configuration section in each script:

```bash
# In start.sh, start-dev.sh, stop.sh, status.sh
BACKEND_PORT=5001
FRONTEND_PORT=5173
```

### Log Management

Clear log files:

```bash
# Automatic (prompted during stop)
./stop.sh

# Manual
> logs/backend.log
> logs/frontend.log
```

View recent logs:

```bash
# Last 50 lines
tail -50 logs/backend.log

# Last 100 lines
tail -100 logs/frontend.log

# Live tail
tail -f logs/backend.log
```

### Process Management

Find PIDs:

```bash
# From files
cat .backend.pid
cat .frontend.pid

# From ports
lsof -ti:5001
lsof -ti:5173

# From process names
pgrep -f "node.*server.js"
pgrep -f "vite"
```

Kill specific process:

```bash
# Graceful
kill -TERM <PID>

# Force
kill -9 <PID>
```

---

## Script Features Comparison

| Feature | start.sh | start-dev.sh | stop.sh | status.sh |
|---------|----------|--------------|---------|-----------|
| Health Checks | ✅ | ✅ | ❌ | ✅ |
| Auto Dependencies | ✅ | ✅ | ❌ | ❌ |
| Port Cleanup | ✅ | ✅ | ✅ | ❌ |
| Process Monitoring | ✅ | ✅ | ✅ | ✅ |
| Graceful Shutdown | ❌ | ❌ | ✅ | ❌ |
| Force Mode | ❌ | ❌ | ✅ | ❌ |
| Log Tailing | ✅ | ❌ | ❌ | ❌ |
| Separate Terminals | ❌ | ✅ | ❌ | ❌ |
| Status Display | ✅ | ✅ | ✅ | ✅ |

---

## File Locations

```
timber-mart-crm/
├── start.sh              # Production start script
├── start-dev.sh          # Development mode script
├── stop.sh               # Enhanced stop script
├── status.sh             # Status check script
├── logs/
│   ├── backend.log       # Backend logs
│   └── frontend.log      # Frontend logs
├── .backend.pid          # Backend PID (auto-generated)
└── .frontend.pid         # Frontend PID (auto-generated)
```

---

## Best Practices

1. **Development**: Use `./start-dev.sh` for active development with auto-reload
2. **Production**: Use `./start.sh` for deployment and testing
3. **Status Check**: Run `./status.sh` before starting to check current state
4. **Clean Stop**: Always use `./stop.sh` before restarting services
5. **Force Stop**: Use `./stop.sh --force` only when normal stop fails
6. **Log Monitoring**: Keep logs open in separate terminal during development

---

## Performance Monitoring

Check resource usage:

```bash
# Overall status with CPU/MEM
./status.sh

# Detailed process info
ps aux | grep node

# Watch in real-time
watch -n 2 './status.sh'
```

---

## Integration with CI/CD

These scripts can be used in CI/CD pipelines:

```bash
# Start for testing
./start.sh

# Wait for health
timeout 30 bash -c 'until curl -f http://localhost:5001/api/health; do sleep 1; done'

# Run tests
npm test

# Stop services
./stop.sh --force
```

---

## Support

For issues or questions:
- Check logs: `tail -f logs/backend.log logs/frontend.log`
- Run status: `./status.sh`
- Check ports: `lsof -i :5001 -i :5173`

---

**Last Updated:** October 20, 2025
**Version:** 2.0 (Enhanced)
