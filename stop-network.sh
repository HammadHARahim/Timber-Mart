#!/bin/bash

# ============================================================================
# Timber Mart CRM - Stop Network Hosting Script
# ============================================================================
# This script stops the backend and frontend servers that were started
# with start-network.sh
# ============================================================================

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}           Stopping Timber Mart CRM Servers${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Function to stop a process by PID file
stop_by_pid_file() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping $service_name (PID: $PID)...${NC}"
            kill $PID 2>/dev/null
            sleep 2

            # Force kill if still running
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}Force stopping $service_name...${NC}"
                kill -9 $PID 2>/dev/null
            fi

            echo -e "${GREEN}✓ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}$service_name is not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}No PID file found for $service_name${NC}"
    fi
}

# Stop backend server
stop_by_pid_file "$SCRIPT_DIR/.backend.pid" "Backend server"

# Stop frontend server
stop_by_pid_file "$SCRIPT_DIR/.frontend.pid" "Frontend server"

# Additional cleanup - kill any remaining processes on the ports
echo ""
echo -e "${YELLOW}Cleaning up ports...${NC}"

BACKEND_PIDS=$(lsof -ti:6000 2>/dev/null)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo -e "${YELLOW}Found processes on port 6000, stopping...${NC}"
    echo "$BACKEND_PIDS" | xargs -r kill -9 2>/dev/null
    echo -e "${GREEN}✓ Port 6000 cleared${NC}"
fi

FRONTEND_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}Found processes on port 3000, stopping...${NC}"
    echo "$FRONTEND_PIDS" | xargs -r kill -9 2>/dev/null
    echo -e "${GREEN}✓ Port 3000 cleared${NC}"
fi

echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}✓ All servers stopped successfully${NC}"
echo -e "${BLUE}============================================================================${NC}"
