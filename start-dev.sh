#!/bin/bash

# ============================================================================
# TIMBER MART CRM - DEVELOPMENT MODE (Enhanced)
# Starts both servers in separate terminal windows for easy debugging
# ============================================================================

echo "🚀 Starting Timber Mart CRM in Development Mode..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKEND_PORT=5001
FRONTEND_PORT=5173

# Create logs directory
mkdir -p logs

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

# Check dependencies
check_dependencies "backend" "Backend"
check_dependencies "frontend" "Frontend"

# Kill existing processes
echo ""
echo -e "${BLUE}Checking for existing processes...${NC}"

BACKEND_PIDS=$(lsof -ti:$BACKEND_PORT 2>/dev/null)
if [ -n "$BACKEND_PIDS" ]; then
    echo -e "${YELLOW}Stopping existing backend on port $BACKEND_PORT...${NC}"
    kill -9 $BACKEND_PIDS 2>/dev/null || true
    sleep 1
fi

FRONTEND_PIDS=$(lsof -ti:$FRONTEND_PORT 2>/dev/null)
if [ -n "$FRONTEND_PIDS" ]; then
    echo -e "${YELLOW}Stopping existing frontend on port $FRONTEND_PORT...${NC}"
    kill -9 $FRONTEND_PIDS 2>/dev/null || true
    sleep 1
fi

# Clean up PID files
rm -f .backend.pid .frontend.pid

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Starting in separate terminal windows...${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Detect terminal emulator
TERMINAL=""
if command -v gnome-terminal &> /dev/null; then
    TERMINAL="gnome-terminal"
    echo -e "${GREEN}✅ Using gnome-terminal${NC}"
elif command -v konsole &> /dev/null; then
    TERMINAL="konsole"
    echo -e "${GREEN}✅ Using konsole${NC}"
elif command -v xfce4-terminal &> /dev/null; then
    TERMINAL="xfce4-terminal"
    echo -e "${GREEN}✅ Using xfce4-terminal${NC}"
elif command -v xterm &> /dev/null; then
    TERMINAL="xterm"
    echo -e "${GREEN}✅ Using xterm${NC}"
else
    echo -e "${YELLOW}No supported terminal emulator found${NC}"
    echo -e "${YELLOW}Falling back to standard start script...${NC}"
    echo ""
    exec ./start.sh
fi

# Get absolute path to project
PROJECT_DIR=$(pwd)

# Start backend in new terminal
echo ""
echo -e "${GREEN}Opening Backend Server terminal (Port $BACKEND_PORT)...${NC}"

if [ "$TERMINAL" = "gnome-terminal" ]; then
    gnome-terminal --title="Backend Server - Port $BACKEND_PORT" --working-directory="$PROJECT_DIR/backend" -- bash -c "echo '🔧 Starting Backend Server...'; echo ''; npm run dev; echo ''; echo 'Backend stopped. Press any key to close...'; read -n 1" &
elif [ "$TERMINAL" = "konsole" ]; then
    konsole --title "Backend Server - Port $BACKEND_PORT" --workdir "$PROJECT_DIR/backend" -e bash -c "echo '🔧 Starting Backend Server...'; echo ''; npm run dev; echo ''; echo 'Backend stopped. Press any key to close...'; read -n 1" &
elif [ "$TERMINAL" = "xfce4-terminal" ]; then
    xfce4-terminal --title="Backend Server - Port $BACKEND_PORT" --working-directory="$PROJECT_DIR/backend" -e bash -c "echo '🔧 Starting Backend Server...'; echo ''; npm run dev; echo ''; echo 'Backend stopped. Press any key to close...'; read -n 1" &
else
    xterm -title "Backend Server - Port $BACKEND_PORT" -e "cd '$PROJECT_DIR/backend' && echo '🔧 Starting Backend Server...' && echo '' && npm run dev; echo ''; echo 'Backend stopped. Press any key to close...'; read -n 1" &
fi

BACKEND_TERMINAL_PID=$!
sleep 2

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
RETRIES=0
MAX_RETRIES=15

while [ $RETRIES -lt $MAX_RETRIES ]; do
    if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running on port $BACKEND_PORT${NC}"
        break
    fi
    sleep 1
    RETRIES=$((RETRIES + 1))
    echo -n "."
done
echo ""

if [ $RETRIES -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Backend failed to start within expected time${NC}"
    echo -e "${YELLOW}Check the backend terminal window for errors${NC}"
fi

# Start frontend in new terminal
echo ""
echo -e "${GREEN}Opening Frontend Client terminal (Port $FRONTEND_PORT)...${NC}"

if [ "$TERMINAL" = "gnome-terminal" ]; then
    gnome-terminal --title="Frontend Client - Port $FRONTEND_PORT" --working-directory="$PROJECT_DIR/frontend" -- bash -c "echo '🎨 Starting Frontend Client...'; echo ''; npm run dev; echo ''; echo 'Frontend stopped. Press any key to close...'; read -n 1" &
elif [ "$TERMINAL" = "konsole" ]; then
    konsole --title "Frontend Client - Port $FRONTEND_PORT" --workdir "$PROJECT_DIR/frontend" -e bash -c "echo '🎨 Starting Frontend Client...'; echo ''; npm run dev; echo ''; echo 'Frontend stopped. Press any key to close...'; read -n 1" &
elif [ "$TERMINAL" = "xfce4-terminal" ]; then
    xfce4-terminal --title="Frontend Client - Port $FRONTEND_PORT" --working-directory="$PROJECT_DIR/frontend" -e bash -c "echo '🎨 Starting Frontend Client...'; echo ''; npm run dev; echo ''; echo 'Frontend stopped. Press any key to close...'; read -n 1" &
else
    xterm -title "Frontend Client - Port $FRONTEND_PORT" -e "cd '$PROJECT_DIR/frontend' && echo '🎨 Starting Frontend Client...' && echo '' && npm run dev; echo ''; echo 'Frontend stopped. Press any key to close...'; read -n 1" &
fi

FRONTEND_TERMINAL_PID=$!
sleep 2

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
RETRIES=0

while [ $RETRIES -lt $MAX_RETRIES ]; do
    if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running on port $FRONTEND_PORT${NC}"
        break
    fi
    sleep 1
    RETRIES=$((RETRIES + 1))
    echo -n "."
done
echo ""

if [ $RETRIES -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Frontend failed to start within expected time${NC}"
    echo -e "${YELLOW}Check the frontend terminal window for errors${NC}"
fi

# Display final status
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 Development Mode Started!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}📊 Backend API:${NC}      http://localhost:$BACKEND_PORT"
echo -e "${GREEN}   Health Check:${NC}     http://localhost:$BACKEND_PORT/api/health"
echo -e "${GREEN}🖥️  Frontend App:${NC}     http://localhost:$FRONTEND_PORT"
echo ""
echo -e "${BLUE}Default Login Credentials:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo -e "${BLUE}Development Features:${NC}"
echo "  • Hot Module Replacement (HMR) enabled"
echo "  • Auto-restart on file changes"
echo "  • Detailed error messages"
echo "  • Source maps enabled"
echo ""
echo -e "${BLUE}Terminal Windows:${NC}"
echo "  • Backend:  Running with nodemon"
echo "  • Frontend: Running with Vite dev server"
echo ""
echo -e "${RED}To stop:${NC}"
echo -e "  • Close the terminal windows, OR"
echo -e "  • Run: ${GREEN}./stop.sh${NC}"
echo -e "  • For force stop: ${GREEN}./stop.sh --force${NC}"
echo ""
echo -e "${BLUE}================================================${NC}"
echo ""
