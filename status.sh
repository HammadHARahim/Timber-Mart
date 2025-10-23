#!/bin/bash

# ============================================================================
# TIMBER MART CRM - STATUS CHECK SCRIPT
# Check the status of backend and frontend services
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKEND_PORT=5001
FRONTEND_PORT=5173
BACKEND_HEALTH_URL="http://localhost:${BACKEND_PORT}/api/health"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   TIMBER MART CRM - STATUS CHECK${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null
}

# Function to get process info
get_process_info() {
    local pid=$1
    if [ -n "$pid" ] && ps -p $pid > /dev/null 2>&1; then
        local cmd=$(ps -p $pid -o cmd= 2>/dev/null | cut -c 1-50)
        local cpu=$(ps -p $pid -o %cpu= 2>/dev/null | xargs)
        local mem=$(ps -p $pid -o %mem= 2>/dev/null | xargs)
        local uptime=$(ps -p $pid -o etime= 2>/dev/null | xargs)
        echo "PID $pid | CPU: ${cpu}% | MEM: ${mem}% | Uptime: $uptime"
        echo "Command: $cmd"
    fi
}

# Check Node.js and npm
echo -e "${BLUE}System Information:${NC}"
if command -v node &> /dev/null; then
    echo -e "  ${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "  ${RED}❌ Node.js: Not installed${NC}"
fi

if command -v npm &> /dev/null; then
    echo -e "  ${GREEN}✅ npm: $(npm --version)${NC}"
else
    echo -e "  ${RED}❌ npm: Not installed${NC}"
fi

echo ""

# Check Backend
echo -e "${BLUE}Backend Server (Port $BACKEND_PORT):${NC}"
BACKEND_PID=$(check_port $BACKEND_PORT)

if [ -n "$BACKEND_PID" ]; then
    echo -e "  ${GREEN}✅ Running${NC}"
    echo "  $(get_process_info $BACKEND_PID)"

    # Health check
    echo -n "  Health Check: "
    if curl -s -f "$BACKEND_HEALTH_URL" > /dev/null 2>&1; then
        HEALTH_RESPONSE=$(curl -s "$BACKEND_HEALTH_URL")
        echo -e "${GREEN}✅ Healthy${NC}"
        echo "  Response: $HEALTH_RESPONSE"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
else
    echo -e "  ${RED}❌ Not running${NC}"

    # Check PID file
    if [ -f .backend.pid ]; then
        PID_FROM_FILE=$(cat .backend.pid 2>/dev/null)
        if [ -n "$PID_FROM_FILE" ]; then
            echo -e "  ${YELLOW}⚠️  Stale PID file exists (PID: $PID_FROM_FILE)${NC}"
        fi
    fi
fi

echo ""

# Check Frontend
echo -e "${BLUE}Frontend Client (Port $FRONTEND_PORT):${NC}"
FRONTEND_PID=$(check_port $FRONTEND_PORT)

if [ -n "$FRONTEND_PID" ]; then
    echo -e "  ${GREEN}✅ Running${NC}"
    echo "  $(get_process_info $FRONTEND_PID)"

    # Connectivity check
    echo -n "  Connectivity: "
    if curl -s -f "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Accessible${NC}"
    else
        echo -e "${RED}❌ Not accessible${NC}"
    fi
else
    echo -e "  ${RED}❌ Not running${NC}"

    # Check PID file
    if [ -f .frontend.pid ]; then
        PID_FROM_FILE=$(cat .frontend.pid 2>/dev/null)
        if [ -n "$PID_FROM_FILE" ]; then
            echo -e "  ${YELLOW}⚠️  Stale PID file exists (PID: $PID_FROM_FILE)${NC}"
        fi
    fi
fi

echo ""

# Check dependencies
echo -e "${BLUE}Dependencies:${NC}"
if [ -d "backend/node_modules" ]; then
    echo -e "  ${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "  ${RED}❌ Backend dependencies missing${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "  ${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "  ${RED}❌ Frontend dependencies missing${NC}"
fi

echo ""

# Check log files
echo -e "${BLUE}Log Files:${NC}"
if [ -f "logs/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h logs/backend.log | cut -f1)
    BACKEND_LOG_LINES=$(wc -l < logs/backend.log)
    echo -e "  Backend:  ${BACKEND_LOG_SIZE} (${BACKEND_LOG_LINES} lines)"
else
    echo -e "  Backend:  ${YELLOW}No log file${NC}"
fi

if [ -f "logs/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h logs/frontend.log | cut -f1)
    FRONTEND_LOG_LINES=$(wc -l < logs/frontend.log)
    echo -e "  Frontend: ${FRONTEND_LOG_SIZE} (${FRONTEND_LOG_LINES} lines)"
else
    echo -e "  Frontend: ${YELLOW}No log file${NC}"
fi

echo ""

# Overall status
echo -e "${BLUE}================================================${NC}"
if [ -n "$BACKEND_PID" ] && [ -n "$FRONTEND_PID" ]; then
    echo -e "${GREEN}Overall Status: ✅ ALL SERVICES RUNNING${NC}"
    echo ""
    echo -e "${GREEN}🌐 Access URLs:${NC}"
    echo -e "  Backend API:  http://localhost:$BACKEND_PORT"
    echo -e "  Frontend App: http://localhost:$FRONTEND_PORT"
elif [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ]; then
    echo -e "${YELLOW}Overall Status: ⚠️  PARTIAL - Some services running${NC}"
    echo ""
    echo -e "${YELLOW}Action Required:${NC}"
    [ -z "$BACKEND_PID" ] && echo "  • Start backend: cd backend && npm start"
    [ -z "$FRONTEND_PID" ] && echo "  • Start frontend: cd frontend && npm run dev"
else
    echo -e "${RED}Overall Status: ❌ NO SERVICES RUNNING${NC}"
    echo ""
    echo -e "${BLUE}To start services:${NC}"
    echo "  ./start.sh      - Production mode"
    echo "  ./start-dev.sh  - Development mode"
fi
echo -e "${BLUE}================================================${NC}"
echo ""

# Management commands
echo -e "${BLUE}Management Commands:${NC}"
echo "  ./start.sh         - Start all services (production)"
echo "  ./start-dev.sh     - Start in development mode"
echo "  ./stop.sh          - Stop all services (graceful)"
echo "  ./stop.sh --force  - Force stop all services"
echo "  ./status.sh        - Check service status"
echo ""

# Quick actions
if [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ]; then
    echo -e "${BLUE}Quick Actions:${NC}"
    echo "  tail -f logs/backend.log   - View backend logs"
    echo "  tail -f logs/frontend.log  - View frontend logs"
    echo "  ./stop.sh                  - Stop all services"
    echo ""
fi
