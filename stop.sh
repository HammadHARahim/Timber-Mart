#!/bin/bash

# ============================================================================
# TIMBER MART CRM - STOP SCRIPT (Enhanced)
# Powerful stop script with multiple fallback methods
# ============================================================================

echo "🛑 Stopping Timber Mart CRM..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKEND_PORT=5001
FRONTEND_PORT=5173
FORCE_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE_MODE=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./stop.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --force    Force kill all processes immediately"
            echo "  -h, --help     Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to kill process gracefully
kill_process() {
    local pid=$1
    local name=$2

    if [ -z "$pid" ]; then
        return 0
    fi

    if ! ps -p $pid > /dev/null 2>&1; then
        echo -e "${BLUE}$name (PID: $pid) is not running${NC}"
        return 0
    fi

    echo -e "${YELLOW}Stopping $name (PID: $pid)...${NC}"

    if [ "$FORCE_MODE" = true ]; then
        # Force kill immediately
        kill -9 $pid 2>/dev/null
        sleep 0.5
    else
        # Graceful shutdown
        kill -TERM $pid 2>/dev/null

        # Wait up to 5 seconds for graceful shutdown
        local count=0
        while ps -p $pid > /dev/null 2>&1 && [ $count -lt 5 ]; do
            sleep 1
            count=$((count + 1))
            echo -n "."
        done
        echo ""

        # Force kill if still running
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Graceful shutdown failed, force killing...${NC}"
            kill -9 $pid 2>/dev/null
            sleep 0.5
        fi
    fi

    # Verify process is dead
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${RED}❌ Failed to kill $name${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $name stopped successfully${NC}"
        return 0
    fi
}

# Function to kill all processes by name pattern
kill_by_pattern() {
    local pattern=$1
    local name=$2

    local pids=$(pgrep -f "$pattern" 2>/dev/null)

    if [ -z "$pids" ]; then
        return 0
    fi

    echo -e "${YELLOW}Found $name processes: $pids${NC}"

    for pid in $pids; do
        kill_process $pid "$name"
    done
}

# Function to kill processes on port
kill_by_port() {
    local port=$1
    local name=$2

    local pids=$(lsof -ti:$port 2>/dev/null)

    if [ -z "$pids" ]; then
        echo -e "${BLUE}No process found on port $port${NC}"
        return 0
    fi

    echo -e "${YELLOW}Killing process(es) on port $port...${NC}"

    for pid in $pids; do
        local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
        echo -e "${YELLOW}  Killing $process_name (PID: $pid)${NC}"

        if [ "$FORCE_MODE" = true ]; then
            kill -9 $pid 2>/dev/null
        else
            kill -TERM $pid 2>/dev/null
            sleep 1
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
            fi
        fi
    done

    sleep 0.5

    # Verify port is free
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is still in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is now free${NC}"
        return 0
    fi
}

# Display mode
if [ "$FORCE_MODE" = true ]; then
    echo -e "${RED}⚠️  FORCE MODE ENABLED - Immediate termination${NC}"
    echo ""
fi

# Method 1: Kill by PID files
echo -e "${BLUE}Method 1: Stopping via PID files...${NC}"
STOPPED_VIA_PID=false

if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid 2>/dev/null)
    if [ -n "$BACKEND_PID" ]; then
        if kill_process $BACKEND_PID "Backend Server"; then
            STOPPED_VIA_PID=true
        fi
    fi
    rm -f .backend.pid
else
    echo -e "${BLUE}No backend PID file found${NC}"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid 2>/dev/null)
    if [ -n "$FRONTEND_PID" ]; then
        if kill_process $FRONTEND_PID "Frontend Client"; then
            STOPPED_VIA_PID=true
        fi
    fi
    rm -f .frontend.pid
else
    echo -e "${BLUE}No frontend PID file found${NC}"
fi

echo ""

# Method 2: Kill by port
echo -e "${BLUE}Method 2: Stopping via port numbers...${NC}"
kill_by_port $BACKEND_PORT "Backend (Port $BACKEND_PORT)"
kill_by_port $FRONTEND_PORT "Frontend (Port $FRONTEND_PORT)"

echo ""

# Method 3: Kill by process name pattern
echo -e "${BLUE}Method 3: Stopping via process patterns...${NC}"
kill_by_pattern "node.*server.js" "Backend Server"
kill_by_pattern "vite.*frontend" "Frontend Vite Server"
kill_by_pattern "npm.*start.*backend" "Backend npm"
kill_by_pattern "npm.*dev.*frontend" "Frontend npm"

echo ""

# Method 4: Nuclear option - kill all node processes in project directory (only if force mode)
if [ "$FORCE_MODE" = true ]; then
    echo -e "${RED}Method 4: Nuclear cleanup (all Node.js processes)...${NC}"

    # Get all node processes
    NODE_PIDS=$(pgrep -x node 2>/dev/null)

    if [ -n "$NODE_PIDS" ]; then
        echo -e "${YELLOW}Found Node.js processes, checking if related to project...${NC}"

        for pid in $NODE_PIDS; do
            # Check if process is in our project directory
            cwd=$(pwdx $pid 2>/dev/null | awk '{print $2}')
            if [[ "$cwd" == *"timber-mart-crm"* ]]; then
                echo -e "${YELLOW}Killing Node process in project (PID: $pid)${NC}"
                kill -9 $pid 2>/dev/null
            fi
        done
    fi
fi

echo ""

# Verify all ports are free
echo -e "${BLUE}Verifying cleanup...${NC}"
BACKEND_CHECK=$(lsof -ti:$BACKEND_PORT 2>/dev/null)
FRONTEND_CHECK=$(lsof -ti:$FRONTEND_PORT 2>/dev/null)

if [ -n "$BACKEND_CHECK" ]; then
    echo -e "${RED}⚠️  Warning: Port $BACKEND_PORT is still in use by PID $BACKEND_CHECK${NC}"
    echo -e "${YELLOW}   Run: kill -9 $BACKEND_CHECK${NC}"
    EXIT_CODE=1
elif [ -n "$FRONTEND_CHECK" ]; then
    echo -e "${RED}⚠️  Warning: Port $FRONTEND_PORT is still in use by PID $FRONTEND_CHECK${NC}"
    echo -e "${YELLOW}   Run: kill -9 $FRONTEND_CHECK${NC}"
    EXIT_CODE=1
else
    echo -e "${GREEN}✅ All ports verified clean${NC}"
    EXIT_CODE=0
fi

# Clean up log files option
echo ""
read -p "Do you want to clear log files? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Clearing log files...${NC}"
    > logs/backend.log 2>/dev/null || true
    > logs/frontend.log 2>/dev/null || true
    echo -e "${GREEN}✅ Log files cleared${NC}"
fi

# Final summary
echo ""
echo -e "${BLUE}================================================${NC}"
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Timber Mart CRM stopped successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Timber Mart CRM stopped with warnings${NC}"
fi
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${BLUE}To start again, run:${NC}"
echo -e "  ${GREEN}./start.sh${NC}      - Production mode"
echo -e "  ${GREEN}./start-dev.sh${NC}  - Development mode"
echo ""

exit $EXIT_CODE
