# Network Hosting Guide

This guide explains how to run the Timber Mart CRM application on your local network, making it accessible from any device on the same network.

## Quick Start

### Start the Application on Network

```bash
bash start-network.sh
```

This will:
- Start the backend server on port 6000
- Start the frontend server on port 3000
- Make both servers accessible on your local network
- Display your network IP address and access URLs

### Stop the Application

```bash
bash stop-network.sh
```

This will cleanly shut down both the backend and frontend servers.

## Configuration

The application is pre-configured for network hosting with the following settings:

### Backend Configuration (`/backend/.env`)
```
PORT=6000
```

The backend server binds to `0.0.0.0` (all network interfaces) by default.

### Frontend Configuration (`/frontend/.env`)
```
VITE_API_URL=http://localhost:6000
```

### Vite Configuration (`/frontend/vite.config.js`)
```javascript
server: {
  host: '0.0.0.0',  // Expose on network
  port: 3000,
  strictPort: false,
  open: false
}
```

## Access URLs

After running `start-network.sh`, you'll see output like:

```
✓ Timber Mart CRM is now running on the network!

Access the application:
  • From this computer: http://localhost:3000
  • From other devices:  http://192.168.1.100:3000

API Endpoints:
  • Local:  http://localhost:6000/api
  • Network: http://192.168.1.100:6000/api
```

Replace `192.168.1.100` with your actual network IP address shown in the output.

## Accessing from Other Devices

### On the Same Network

Any device connected to the same Wi-Fi or LAN network can access the application by:

1. Opening a web browser
2. Navigating to `http://YOUR_NETWORK_IP:3000`
3. Logging in with your credentials

**Example:** If your network IP is `192.168.1.100`:
- Access URL: `http://192.168.1.100:3000`

### Finding Your Network IP

The network IP is automatically displayed when you run `start-network.sh`.

You can also find it manually:
```bash
hostname -I | awk '{print $1}'
```

Or:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

## Firewall Configuration

If other devices can't connect, you may need to allow traffic on ports 3000 and 6000:

### Ubuntu/Debian (UFW)
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 6000/tcp
```

### Fedora/RHEL (firewalld)
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=6000/tcp
sudo firewall-cmd --reload
```

## Logs

The scripts create log files in the `logs/` directory:

- Backend logs: `logs/backend.log`
- Frontend logs: `logs/frontend.log`

To monitor logs in real-time:

```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log
```

## Troubleshooting

### Port Already in Use

If you see an error about ports being in use:

```bash
# Stop all processes
bash stop-network.sh

# Wait a few seconds
sleep 3

# Start again
bash start-network.sh
```

### Can't Access from Other Devices

1. **Check firewall:** Ensure ports 3000 and 6000 are allowed
2. **Check network:** Ensure all devices are on the same network
3. **Check IP address:** Use the IP shown by `start-network.sh`
4. **Check antivirus:** Some antivirus software may block network access

### Server Crashes or Won't Start

Check the log files:
```bash
# View backend logs
cat logs/backend.log

# View frontend logs
cat logs/frontend.log
```

Common issues:
- Database not running (PostgreSQL)
- Missing dependencies (run `npm install` in backend and frontend directories)
- Port conflicts (stop other applications using ports 3000 or 6000)

## Production Deployment

**Warning:** These scripts are designed for development and local network use only.

For production deployment:
1. Use proper process managers (PM2, systemd)
2. Set up SSL/HTTPS with proper certificates
3. Use environment-specific configurations
4. Set up proper logging and monitoring
5. Use a reverse proxy (nginx, Apache)
6. Implement proper security measures

## Script Details

### start-network.sh

Features:
- Automatic port availability checking
- Network IP detection and display
- Background process management
- PID file creation for process tracking
- Log file rotation
- Dependency checking
- Server health monitoring

### stop-network.sh

Features:
- Graceful shutdown with SIGTERM
- Force kill fallback after timeout
- Port cleanup
- PID file cleanup
- Status reporting

## Alternative: Manual Startup

If you prefer to start servers manually:

### Backend
```bash
cd backend
npm run dev
```

### Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

Both servers are already configured for network access, so manual startup will also work on the network.

## Security Notes

When hosting on your local network:

1. **Use strong passwords** for all user accounts
2. **Keep the database secure** - ensure PostgreSQL is not exposed externally
3. **Use HTTPS in production** - the development setup uses HTTP only
4. **Trust your network** - only use on trusted private networks
5. **Update regularly** - keep dependencies up to date for security patches

## Support

For issues or questions:
- Check the main README.md file
- Review the logs in the `logs/` directory
- Check the PHASE_COMPLETION_SUMMARY.md for implementation details
