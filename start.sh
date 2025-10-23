#!/bin/bash

# ============================================================================
# TIMBER MART CRM - START SCRIPT (Enhanced)
# Starts both backend server and frontend client with health checks
# ============================================================================

set -e  # Exit on error

echo "🚀 Starting Timber Mart CRM..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=5001
FRONTEND_PORT=5173
BACKEND_HEALTH_URL="http://localhost:${BACKEND_PORT}/api/health"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
MAX_RETRIES=30
RETRY_DELAY=1

# Create logs directory
mkdir -p logs

# Function to check if port is in use
check_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null
}

# Function to wait for service health
wait_for_health() {
    local url=$1
    local name=$2
    local retries=0

    echo -e "${YELLOW}Waiting for $name to be healthy...${NC}"

    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is healthy!${NC}"
            return 0
        fi
        retries=$((retries + 1))
        echo -n "."
        sleep $RETRY_DELAY
    done

    echo ""
    echo -e "${RED}❌ $name failed to become healthy after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to check and install dependencies
check_dependencies() {
    local dir=$1
    local name=$2

    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}Installing $name dependencies...${NC}"
        cd "$dir"
        npm install || {
            echo -e "${RED}❌ Failed to install $name dependencies${NC}"
            exit 1
        }
        cd - > /dev/null
        echo -e "${GREEN}✅ $name dependencies installed${NC}"
    else
        echo -e "${GREEN}✅ $name dependencies already installed${NC}"
    fi
}

# Stop existing processes
echo -e "${BLUE}Checking for existing processes...${NC}"
BACKEND_PIDS=$(check_port $BACKEND_PORT)
FRONTEND_PIDS=$(check_port $FRONTEND_PORT)

if [ -n "$BACKEND_PIDS" ]; then
    echo -e "${YELLOW}Stopping existing backend process(es) on port $BACKEND_PORT...${NC}"
    kill -9 $BACKEND_PIDS 2>/dev/null || true
    sleep 1
fi

if [ -n "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}Stopping existing frontend process(es) on port $FRONTEND_PORT...${NC}"
    kill -9 $FRONTEND_PIDS 2>/dev/null || true
    sleep 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) and npm $(npm --version) detected${NC}"
echo ""

# Check and install dependencies
check_dependencies "backend" "Backend"
check_dependencies "frontend" "Frontend"

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🔧 Starting Backend Server (Port $BACKEND_PORT)${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Start backend in background
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Save PID immediately
echo $BACKEND_PID > .backend.pid

# Verify backend process started
sleep 2
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend process failed to start${NC}"
    echo -e "${RED}Last 20 lines of backend log:${NC}"
    tail -20 logs/backend.log
    exit 1
fi

# Wait for backend health check
if wait_for_health "$BACKEND_HEALTH_URL" "Backend"; then
    echo -e "${GREEN}✅ Backend server running (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}   URL: http://localhost:$BACKEND_PORT${NC}"
else
    echo -e "${RED}Backend log output:${NC}"
    tail -50 logs/backend.log
    kill -9 $BACKEND_PID 2>/dev/null || true
    rm -f .backend.pid
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎨 Starting Frontend Client (Port $FRONTEND_PORT)${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Start frontend in background
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Save PID immediately
echo $FRONTEND_PID > .frontend.pid

# Verify frontend process started
sleep 2
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend process failed to start${NC}"
    echo -e "${RED}Last 20 lines of frontend log:${NC}"
    tail -20 logs/frontend.log
    kill -9 $BACKEND_PID 2>/dev/null || true
    rm -f .backend.pid .frontend.pid
    exit 1
fi

# Wait for frontend to be available
if wait_for_health "$FRONTEND_URL" "Frontend"; then
    echo -e "${GREEN}✅ Frontend client running (PID: $FRONTEND_PID)${NC}"
    echo -e "${GREEN}   URL: http://localhost:$FRONTEND_PORT${NC}"
else
    echo -e "${RED}Frontend log output:${NC}"
    tail -50 logs/frontend.log
    kill -9 $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    rm -f .backend.pid .frontend.pid
    exit 1
fi

# Final status display
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 TIMBER MART CRM IS RUNNING!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}📊 Backend API:${NC}  http://localhost:$BACKEND_PORT"
echo -e "${GREEN}   Health Check:${NC}  http://localhost:$BACKEND_PORT/api/health"
echo -e "${GREEN}🖥️  Frontend App:${NC} http://localhost:$FRONTEND_PORT"
echo ""
echo -e "${BLUE}Default Login Credentials:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo -e "${BLUE}Process Information:${NC}"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${BLUE}Log Files:${NC}"
echo "  Backend:  logs/backend.log"
echo "  Frontend: logs/frontend.log"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo -e "  ${GREEN}./stop.sh${NC}     - Stop all services"
echo -e "  ${GREEN}./start-dev.sh${NC} - Start in development mode"
echo ""
echo -e "${RED}To stop: Press Ctrl+C then run ./stop.sh${NC}"
echo -e "${BLUE}================================================${NC}"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Caught interrupt signal...${NC}"
    echo -e "${YELLOW}Servers are still running in background${NC}"
    echo -e "${RED}Run ./stop.sh to stop all services${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running and tail logs
echo ""
echo -e "${BLUE}📋 Showing live logs (Ctrl+C to exit)...${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Tail both logs with labels
tail -f logs/backend.log logs/frontend.log
