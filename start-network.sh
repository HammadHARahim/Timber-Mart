#!/bin/bash

# ============================================================================
# Timber Mart CRM - Network Hosting Script
# ============================================================================
# This script starts both the backend and frontend servers configured for
# network access. The application will be accessible from any device on the
# same local network.
# ============================================================================

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Log file locations
BACKEND_LOG="$SCRIPT_DIR/logs/backend.log"
FRONTEND_LOG="$SCRIPT_DIR/logs/frontend.log"

# Create logs directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/logs"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}           Timber Mart CRM - Network Hosting${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}Warning: Port $port is already in use${NC}"
        echo -e "${YELLOW}Attempting to free up port $port...${NC}"
        lsof -ti:$port | xargs -r kill -9 2>/dev/null
        sleep 2
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${RED}Error: Unable to free port $port${NC}"
            return 1
        fi
        echo -e "${GREEN}Port $port is now available${NC}"
    fi
    return 0
}

# Function to get local network IP
get_network_ip() {
    hostname -I | awk '{print $1}'
}

# Check if ports are available
echo -e "${BLUE}Checking port availability...${NC}"
check_port 6000 || exit 1
check_port 3000 || exit 1
echo ""

# Get network IP address
NETWORK_IP=$(get_network_ip)
echo -e "${GREEN}Network IP Address: $NETWORK_IP${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory not found at $FRONTEND_DIR${NC}"
    exit 1
fi

# Start Backend Server
echo -e "${BLUE}Starting Backend Server...${NC}"
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
npm run dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 5

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Error: Backend failed to start. Check logs at $BACKEND_LOG${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend server started successfully (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}  Local:   http://localhost:6000${NC}"
echo -e "${GREEN}  Network: http://$NETWORK_IP:6000${NC}"
echo ""

# Start Frontend Server
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to initialize...${NC}"
sleep 5

# Check if frontend is running
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}Error: Frontend failed to start. Check logs at $FRONTEND_LOG${NC}"
    echo -e "${YELLOW}Stopping backend server...${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ Frontend server started successfully (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}  Local:   http://localhost:3000${NC}"
echo -e "${GREEN}  Network: http://$NETWORK_IP:3000${NC}"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > "$SCRIPT_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$SCRIPT_DIR/.frontend.pid"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}✓ Timber Mart CRM is now running on the network!${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  • From this computer: ${GREEN}http://localhost:3000${NC}"
echo -e "  • From other devices:  ${GREEN}http://$NETWORK_IP:3000${NC}"
echo ""
echo -e "${YELLOW}API Endpoints:${NC}"
echo -e "  • Local:  ${GREEN}http://localhost:6000/api${NC}"
echo -e "  • Network: ${GREEN}http://$NETWORK_IP:6000/api${NC}"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "  • Backend:  ${BLUE}tail -f $BACKEND_LOG${NC}"
echo -e "  • Frontend: ${BLUE}tail -f $FRONTEND_LOG${NC}"
echo ""
echo -e "${YELLOW}To stop the servers:${NC}"
echo -e "  • Run: ${BLUE}bash stop-network.sh${NC}"
echo -e "  • Or:  ${BLUE}bash stop.sh${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop monitoring (servers will continue running)${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Monitor the servers
while true; do
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}Backend server stopped unexpectedly!${NC}"
        echo -e "${RED}Check logs at: $BACKEND_LOG${NC}"
        break
    fi
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${RED}Frontend server stopped unexpectedly!${NC}"
        echo -e "${RED}Check logs at: $FRONTEND_LOG${NC}"
        break
    fi
    sleep 5
done
