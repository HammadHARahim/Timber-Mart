# Timber Mart CRM - Startup Guide

Quick guide to start the application.

---

## 🚀 Quick Start

### Option 1: Single Command (Recommended)

Start both backend and frontend together:

```bash
./start.sh
```

This will:
- ✅ Install dependencies (if needed)
- ✅ Start backend server on port 5001
- ✅ Start frontend client on port 5173
- ✅ Create log files in `logs/` directory
- ✅ Display live logs

**Access the app**: http://localhost:5173
**Default login**: admin / admin123

To stop:
```bash
./stop.sh
```

---

### Option 2: Development Mode (Separate Windows)

Start servers in separate terminal windows for easier debugging:

```bash
./start-dev.sh
```

This opens:
- 🖥️ Terminal 1: Backend server logs
- 🖥️ Terminal 2: Frontend client logs

**Perfect for development** - see all output clearly!

To stop: Close the terminal windows or run `./stop.sh`

---

### Option 3: Manual Start

Start each server separately:

**Backend:**
```bash
cd backend
npm install  # First time only
npm start
```

**Frontend (in new terminal):**
```bash
cd frontend
npm install  # First time only
npm run dev
```

---

## 📋 What Gets Started

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Backend API** | 5001 | http://localhost:5001 | REST API server |
| **Frontend App** | 5173 | http://localhost:5173 | React web app |

---

## 🔑 Default Credentials

```
Username: admin
Password: admin123
Role: ADMIN (full permissions)
```

**⚠️ Important**: Change the admin password after first login in production!

---

## 📂 Log Files

Logs are saved to:
- `logs/backend.log` - Backend server logs
- `logs/frontend.log` - Frontend client logs

View live logs:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

---

## 🛠️ Troubleshooting

### Port Already in Use

If you see "port already in use" error:

```bash
# Kill processes on ports
./stop.sh

# Or manually:
lsof -ti:5001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Dependencies Not Installed

If you get module errors:

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Database Connection Error

Make sure PostgreSQL is running:

```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

Check database exists:
```bash
psql -U hammadharahim -d postgres -c "\l" | grep timber_mart
```

### Frontend Can't Connect to Backend

Check `frontend/.env`:
```
VITE_API_URL=http://localhost:5001
```

---

## 🧪 Test Endpoints

Once running, test the API:

```bash
# Health check
curl http://localhost:5001/api/health

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📊 Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **Start (Background)** | `./start.sh` | Start both servers in background |
| **Start (Dev Mode)** | `./start-dev.sh` | Start in separate windows |
| **Stop** | `./stop.sh` | Stop all servers |
| **Backend Only** | `cd backend && npm start` | Start backend manually |
| **Frontend Only** | `cd frontend && npm run dev` | Start frontend manually |

---

## 🎯 Next Steps

After starting the app:

1. Open http://localhost:5173
2. Login with admin/admin123
3. Explore the dashboard
4. Try creating a customer
5. Test user management (Admin only)
6. Check sync functionality (works offline!)

---

## 📚 Documentation

- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What's implemented
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - How to test features
- [PHASE_2-3_COMPLETE.md](PHASE_2-3_COMPLETE.md) - Offline sync details
- [ANALYSIS_REPORT.md](ANALYSIS_REPORT.md) - System analysis

---

## 🆘 Getting Help

If you encounter issues:

1. Check the log files in `logs/`
2. Run `./stop.sh` and restart with `./start.sh`
3. Verify all dependencies are installed
4. Check PostgreSQL is running
5. Review the troubleshooting section above

---

**Happy coding!** 🚀
